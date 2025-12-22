export const CITIES = ['İstanbul'];

export const DISTRICTS = {
    'İstanbul': [
        'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir',
        'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy',
        'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
        'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli',
        'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'
    ]
};

// Mock neighborhoods for demo purposes
// In a real app, this would be a much larger dataset or fetched from an API
export const NEIGHBORHOODS: Record<string, string[]> = {
    'Fatih': ['Akşemsettin', 'Alemdar', 'Atikali', 'Ayvansaray', 'Balabanağa', 'Balat', 'Beyazıt', 'Cibali', 'Derviş Ali', 'Emin Sinan', 'Hacı Kadın', 'Haseki Sultan', 'Hırka-i Şerif', 'Hobyar', 'Hoca Gıyasettin', 'Hoca Paşa', 'İskenderpaşa', 'Kalenderhane', 'Karagümrük', 'Katip Kasım', 'Kemalpaşa', 'Kocamustafapaşa', 'Küçük Ayasofya', 'Mercan', 'Mesih Paşa', 'Mevlanakapı', 'Mimar Hayrettin', 'Mimar Kemalettin', 'Molla Fenari', 'Molla Gürani', 'Molla Hüsrev', 'Muhsine Hatun', 'Nişanca', 'Rüstem Paşa', 'Saraç İshak', 'Seyyid Ömer', 'Silivrikapı', 'Sultan Ahmet', 'Sururi', 'Süleymaniye', 'Sümbül Efendi', 'Tahtakale', 'Taya Hatun', 'Topkapı', 'Yavuz Sinan', 'Yavuz Sultan Selim', 'Yedikule', 'Zeyrek'],
    'Üsküdar': ['Acıbadem', 'Ahmediye', 'Altunizade', 'Aziz Mahmut Hüdayi', 'Bahçelievler', 'Barbaros', 'Beylerbeyi', 'Bulgurlu', 'Burhaniye', 'Cumhuriyet', 'Çengelköy', 'Ferah', 'Güzeltepe', 'İcadiye', 'Kandilli', 'Kısıklı', 'Kirazlıtepe', 'Kuleli', 'Kuzguncuk', 'Küçük Çamlıca', 'Küçüksu', 'Mehmet Akif Ersoy', 'Mimar Sinan', 'Murat Reis', 'Salacak', 'Selamiali', 'Selimiye', 'Sultantepe', 'Ünalan', 'Validei Atik', 'Yavuztürk', 'Zeynep Kamil'],
    'Kadıköy': ['19 Mayıs', 'Acıbadem', 'Bostancı', 'Caddebostan', 'Caferağa', 'Dumlupınar', 'Eğitim', 'Erenköy', 'Fenerbahçe', 'Feneryolu', 'Fikirtepe', 'Göztepe', 'Hasanpaşa', 'Koşuyolu', 'Kozyatağı', 'Merdivenköy', 'Osmanağa', 'Rasimpaşa', 'Sahrayıcedit', 'Suadiye', 'Zühtüpaşa']
    // ... others can be empty or added as needed
};

export const getNeighborhoods = (district: string) => {
    return NEIGHBORHOODS[district] || ['Merkez', 'Fatih', 'Cumhuriyet', 'Atatürk', 'Yeni', 'Eski']; // Fallback generic neighborhoods
};
