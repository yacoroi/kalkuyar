// Supabase Edge Function for Dinamik SMS OTP
// Deploy with: supabase functions deploy send-sms --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DINAMIK_SMS_API_URL = Deno.env.get("DINAMIK_SMS_API_URL") || "https://api.dinamiksms.com.tr/sms"; // Dinamik SMS'ten doğru URL'yi alın
const DINAMIK_SMS_USERNAME = Deno.env.get("DINAMIK_SMS_USERNAME") || ""; // Format: kullaniciadi-bayikodu
const DINAMIK_SMS_PASSWORD = Deno.env.get("DINAMIK_SMS_PASSWORD") || "";
const DINAMIK_SMS_ORIGINATOR = Deno.env.get("DINAMIK_SMS_ORIGINATOR") || ""; // SMS başlığı (max 11 karakter)

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendSMSPayload {
    type: "sms";
    phone: string;
    otp: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload: SendSMSPayload = await req.json();

        console.log("Received SMS request for phone:", payload.phone);

        // Validate payload
        if (!payload.phone || !payload.otp) {
            return new Response(
                JSON.stringify({ error: "Phone and OTP are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Format phone number (remove + if present, ensure it's just digits)
        let phoneNumber = payload.phone.replace(/\D/g, "");
        // If starts with 90, remove it (Dinamik SMS expects local format)
        if (phoneNumber.startsWith("90")) {
            phoneNumber = phoneNumber.substring(2);
        }
        // Ensure it starts with 5
        if (!phoneNumber.startsWith("5")) {
            phoneNumber = "5" + phoneNumber;
        }

        // Create OTP message
        const message = `Dogrulama kodunuz: ${payload.otp}`;

        // Build XML payload for Dinamik SMS
        const xmlPayload = `
      <SingleTextSMS>
        <UserName>${DINAMIK_SMS_USERNAME}</UserName>
        <PassWord>${DINAMIK_SMS_PASSWORD}</PassWord>
        <Action>0</Action>
        <Mesgbody>${message}</Mesgbody>
        <Numbers>${phoneNumber}</Numbers>
        <Originator>${DINAMIK_SMS_ORIGINATOR}</Originator>
      </SingleTextSMS>
    `.trim();

        console.log("Sending SMS to Dinamik SMS API...");

        // Send request to Dinamik SMS
        const response = await fetch(DINAMIK_SMS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
            },
            body: xmlPayload,
        });

        const responseText = await response.text();
        console.log("Dinamik SMS Response:", responseText);

        // Check for success (ID: xxxxx format means success)
        if (responseText.includes("ID:") || responseText.includes("ID :")) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "SMS sent successfully",
                    response: responseText
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        }

        // Check for known error codes
        const errorCodes: Record<string, string> = {
            "01": "Hatalı Kullanıcı Adı, Şifre veya Bayi Kodu",
            "02": "Yetersiz Kredi / Ödenmemiş Fatura Borcu",
            "03": "Tanımsız Action Parametresi",
            "05": "XML Düğümü Eksik veya Hatalı",
            "06": "Tanımsız Originator",
            "07": "Mesaj Kodu (ID) yok",
            "09": "Tarih alanları hatalı",
            "10": "SMS Gönderilemedi",
        };

        // Extract error code if present
        const errorMatch = responseText.match(/(\d{2})/);
        const errorMessage = errorMatch && errorCodes[errorMatch[1]]
            ? errorCodes[errorMatch[1]]
            : `Unknown error: ${responseText}`;

        console.error("SMS sending failed:", errorMessage);

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
                rawResponse: responseText
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("Error in send-sms function:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
