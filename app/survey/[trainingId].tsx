import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'text' | 'rating';
}

interface Training {
    id: number;
    title: string;
    survey_questions: SurveyQuestion[];
}

export default function SurveyScreen() {
    const { trainingId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    const [training, setTraining] = useState<Training | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [responses, setResponses] = useState<Record<string, string | number>>({});

    useEffect(() => {
        fetchTraining();
    }, [trainingId]);

    async function fetchTraining() {
        if (!trainingId) return;

        const { data, error } = await supabase
            .from('trainings')
            .select('id, title, survey_questions')
            .eq('id', trainingId)
            .single();

        if (error) {
            console.error('Error fetching training:', error);
            Alert.alert('Hata', 'Anket yüklenemedi.');
            router.back();
            return;
        }

        setTraining(data as Training);
        setLoading(false);
    }

    const updateResponse = (questionId: string, value: string | number) => {
        setResponses({ ...responses, [questionId]: value });
    };

    async function submitSurvey() {
        if (!training || !user) {
            console.log('No training or user');
            return;
        }

        // Check if all questions are answered
        const questions = training.survey_questions || [];
        const unanswered = questions.filter(q => !responses[q.id] && responses[q.id] !== 0);

        if (unanswered.length > 0) {
            if (Platform.OS === 'web') {
                window.alert('Lütfen tüm soruları cevaplayınız.');
            } else {
                Alert.alert('Eksik Cevap', 'Lütfen tüm soruları cevaplayınız.');
            }
            return;
        }

        setSubmitting(true);

        try {
            // Insert survey responses
            const { error: responseError } = await supabase
                .from('training_survey_responses')
                .upsert({
                    user_id: user.id,
                    training_id: training.id,
                    responses: responses,
                    completed_at: new Date().toISOString()
                }, { onConflict: 'user_id,training_id' });

            if (responseError) throw responseError;

            console.log('Survey saved, updating training_reads...');
            console.log('User ID:', user.id, 'Training ID:', training.id);

            // Mark survey as completed in training_reads (upsert to ensure record exists)
            const { data: updateData, error: updateError } = await supabase
                .from('training_reads')
                .upsert({
                    user_id: user.id,
                    training_id: training.id,
                    survey_completed: true,
                    read_at: new Date().toISOString()
                }, { onConflict: 'user_id,training_id' })
                .select();

            console.log('Upsert result:', updateData, 'Error:', updateError);

            if (updateError) throw updateError;

            if (Platform.OS === 'web') {
                // Use setTimeout to let the alert show before navigating
                setTimeout(() => {
                    window.alert('Teşekkürler! Anket cevaplarınız kaydedildi. 🎉');
                    router.replace('/');
                }, 100);
            } else {
                Alert.alert('Teşekkürler! 🎉', 'Anket cevaplarınız kaydedildi.', [
                    { text: 'Tamam', onPress: () => router.replace('/') }
                ]);
            }

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            if (Platform.OS === 'web') {
                window.alert('Anket gönderilemedi: ' + error.message);
            } else {
                Alert.alert('Hata', 'Anket gönderilemedi: ' + error.message);
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#ea2a33" />
            </SafeAreaView>
        );
    }

    if (!training || !training.survey_questions || training.survey_questions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-gray-500 text-center">Bu içerik için anket bulunmuyor.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-100 flex-row items-center gap-4 bg-white">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#333" />
                </Pressable>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">İçerik Anketi</Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>{training.title}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        padding: 24,
                        paddingBottom: 120,
                        ...(isDesktop ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {})
                    }}
                >
                    <View className="mb-6">
                        <Text className="text-gray-600 leading-6" style={{ fontSize: scaleFont(14) }}>
                            Bu içerikle ilgili görüşlerinizi öğrenmek istiyoruz. Lütfen aşağıdaki soruları cevaplayınız.
                        </Text>
                    </View>

                    {/* Questions */}
                    <View className="gap-6">
                        {training.survey_questions.map((question, index) => (
                            <View key={question.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <Text className="font-medium text-gray-900 mb-3" style={{ fontSize: scaleFont(16) }}>
                                    {index + 1}. {question.question}
                                </Text>

                                {question.type === 'text' ? (
                                    <TextInput
                                        className="bg-white border border-gray-200 rounded-xl p-4 min-h-[100px] text-gray-900"
                                        style={{ fontSize: scaleFont(14) }}
                                        placeholder="Cevabınızı yazınız..."
                                        multiline
                                        textAlignVertical="top"
                                        value={responses[question.id] as string || ''}
                                        onChangeText={(text) => updateResponse(question.id, text)}
                                        placeholderTextColor="#9ca3af"
                                    />
                                ) : (
                                    <View className="flex-row justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Pressable
                                                key={rating}
                                                onPress={() => updateResponse(question.id, rating)}
                                                className="p-2"
                                            >
                                                <Star
                                                    size={36}
                                                    color={responses[question.id] && (responses[question.id] as number) >= rating ? '#f59e0b' : '#d1d5db'}
                                                    fill={responses[question.id] && (responses[question.id] as number) >= rating ? '#f59e0b' : 'transparent'}
                                                />
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View
                    className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100"
                    style={isDesktop ? { alignItems: 'center' } : undefined}
                >
                    <Pressable
                        onPress={submitSurvey}
                        disabled={submitting}
                        style={{
                            width: '100%',
                            maxWidth: isDesktop ? 600 : undefined,
                            height: 56,
                            borderRadius: 28,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            backgroundColor: submitting ? 'rgba(234, 42, 51, 0.7)' : '#ea2a33',
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send size={20} color="white" />
                                <Text className="text-white font-bold" style={{ fontSize: scaleFont(16) }}>
                                    Anketi Gönder
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
