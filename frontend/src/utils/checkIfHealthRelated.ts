import { API_BASE_URL } from '@env';

export const checkIfHealthRelated = async (
    messageText: string
): Promise<boolean> => {
    try {
        console.log('📨 Gönderilen mesaj:', messageText);
        console.log('🌐 API_BASE_URL:', API_BASE_URL);
        console.log('🔗 Full URL:', `${API_BASE_URL}/check`);

        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText }),
        });

        const contentType = response.headers.get('content-type');
        console.log('🧾 Yanıt içeriği türü:', contentType);

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ API başarısız yanıt:', text);
            return false;
        }

        const result = await response.json();
        console.log('🟢 API yanıt verisi:', result);

        return result.isHealthRelated === true;
    } catch (error) {
        console.error('🛑 catch bloğuna girildi:', error);
        return false;
    }
};
