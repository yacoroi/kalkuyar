'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const username = (formData.get('username') as string).trim()
    const password = (formData.get('password') as string).trim()

    if (!username || !password) {
        return { error: 'Kullanıcı adı ve şifre gereklidir.' }
    }

    try {
        // STRATEGY: Username -> Dummy Email
        // username: "admin" -> email: "admin@saadet.admin"
        const dummyEmail = `${username}@saadet.admin`

        console.log(`[Login Attempt] Username: ${username}, DummyEmail: ${dummyEmail}`);

        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password,
        })

        if (authError || !user) {
            console.error('[Login Failed] Auth Error:', authError?.message || 'No user returned');
            // TEMPORARY DEBUG: Return exact error to UI
            return { error: `Giriş başarısız: ${authError?.message || 'Kullanıcı bulunamadı ve ya şifre hatalı'}` }
        }

        console.log('[Login Success] Auth User ID:', user.id);

        // 2. Security Check: Is this user actually an admin?
        const { data: adminRecord, error: adminCheckError } = await supabase
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single()

        if (adminCheckError || !adminRecord) {
            console.error('[Login Failed] Admin Check Error:', adminCheckError?.message || 'User not in admins table');
            // Valid Auth User but NOT in admins table -> Logout and Reject
            await supabase.auth.signOut()
            return { error: 'Yetkisiz giriş. Bu hesap yönetici değil.' }
        }

        console.log('[Login Success] Admin Verified.');

    } catch (error) {
        console.error('Login error:', error)
        return { error: 'Bir hata oluştu.' }
    }

    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
