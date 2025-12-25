// Supabase Edge Function for iletimx SMS OTP
// Deploy with: supabase functions deploy send-sms --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API Configuration
const ILETIMX_API_URL = "http://g.iletimx.com";
const ILETIMX_USERNAME = Deno.env.get("ILETIMX_USERNAME") || "";
const ILETIMX_PASSWORD = Deno.env.get("ILETIMX_PASSWORD") || "";
const ILETIMX_BAYI_KODU = Deno.env.get("ILETIMX_BAYI_KODU") || "3408";
const ILETIMX_ORIGINATOR = Deno.env.get("ILETIMX_ORIGINATOR") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const rawBody = await req.text();
        console.log("Raw request body:", rawBody);

        const payload = JSON.parse(rawBody);
        const phone = payload.user?.phone;
        const otp = payload.sms?.otp;

        console.log("Phone:", phone, "OTP:", otp);

        if (!phone || !otp) {
            return new Response(
                JSON.stringify({ error: "Phone and OTP are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Format phone number
        let phoneNumber = phone.replace(/\D/g, "");
        if (phoneNumber.startsWith("90")) {
            phoneNumber = "0" + phoneNumber.substring(2);
        }
        if (!phoneNumber.startsWith("0")) {
            phoneNumber = "0" + phoneNumber;
        }

        // Türkçe karakter için Action 12 kullanılıyor
        const message = `KalkUyar uygulaması için doğrulama kodunuz: ${otp}`;
        const fullUsername = `${ILETIMX_USERNAME}-${ILETIMX_BAYI_KODU}`;

        // Action 12 = Türkçe karakterli SMS gönderimi
        const xmlPayload = `<MainmsgBody><UserName>${fullUsername}</UserName><PassWord>${ILETIMX_PASSWORD}</PassWord><Action>12</Action><Mesgbody><![CDATA[${message}]]></Mesgbody><Numbers>${phoneNumber}</Numbers><Originator>${ILETIMX_ORIGINATOR}</Originator><SDate></SDate></MainmsgBody>`;

        console.log("Username:", fullUsername);
        console.log("XML Payload:", xmlPayload);

        const encoder = new TextEncoder();
        const bodyBytes = encoder.encode(xmlPayload);

        const response = await fetch(ILETIMX_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: bodyBytes,
        });

        const responseText = await response.text();
        console.log("iletimx Response:", responseText);

        if (responseText.includes("ID:") || responseText.includes("ID :")) {
            return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const errorCodes: Record<string, string> = {
            "01": "Hatalı Kullanıcı Adı, Şifre veya Bayi Kodu",
            "02": "Yetersiz Kredi",
            "06": "Tanımsız Originator",
        };

        const errorMatch = responseText.trim().match(/^(\d{2})$/);
        const errorMessage = errorMatch && errorCodes[errorMatch[1]]
            ? errorCodes[errorMatch[1]]
            : `SMS hatası: ${responseText}`;

        console.error("SMS failed:", errorMessage);
        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
