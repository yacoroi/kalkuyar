import { NextRequest, NextResponse } from 'next/server';

// API Configuration - Coolify ortam değişkenlerinden alınacak
const ILETIMX_API_URL = "http://g.iletimx.com";
const ILETIMX_USERNAME = process.env.ILETIMX_USERNAME || "";
const ILETIMX_PASSWORD = process.env.ILETIMX_PASSWORD || "";
const ILETIMX_BAYI_KODU = process.env.ILETIMX_BAYI_KODU || "3408";
const ILETIMX_ORIGINATOR = process.env.ILETIMX_ORIGINATOR || "";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const phone = payload.user?.phone;
        const otp = payload.sms?.otp;

        console.log("Send SMS - Phone:", phone, "OTP:", otp);

        if (!phone || !otp) {
            return NextResponse.json(
                { error: "Phone and OTP are required" },
                { status: 400 }
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

        console.log("iletimx Username:", fullUsername);

        const response = await fetch(ILETIMX_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: Buffer.from(xmlPayload),
        });

        const responseText = await response.text();
        console.log("iletimx Response:", responseText);

        if (responseText.includes("ID:") || responseText.includes("ID :")) {
            return NextResponse.json({ success: true });
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
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );

    } catch (error) {
        console.error("Send SMS Error:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}

// CORS için OPTIONS desteği
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
