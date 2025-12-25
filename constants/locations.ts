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

// Full dataset based on official records/Wikipedia source
export const NEIGHBORHOODS: Record<string, string[]> = {
    'Adalar': [
        'Burgazada', 'Heybeliada', 'Kınalıada', 'Maden', 'Nizam'
    ],
    'Arnavutköy': [
        'Adnan Menderes', 'Anadolu', 'Arnavutköy Merkez', 'Atatürk', 'Baklalı', 'Balaban', 'Boğazköy İstiklal',
        'Bolluca', 'Boyalık', 'Çilingir', 'Deliklikaya', 'Dursunköy', 'Durusu', 'Fatih', 'Hacımaşlı', 'Hadımköy',
        'Haraççı', 'Hastane', 'Hicret', 'İmrahor', 'İslambey', 'Karaburun', 'Karlıbayır', 'Mareşal Fevzi Çakmak',
        'Mavigöl', 'Mehmet Akif Ersoy', 'Mustafa Kemal Paşa', 'Nene Hatun', 'Ömerli', 'Sazlıbosna', 'Taşoluk',
        'Tayakadın', 'Terkos', 'Yassıören', 'Yavuz Selim', 'Yeniköy', 'Yeşilbayır', 'Yunus Emre'
    ],
    'Ataşehir': [
        'Aşıkveysel', 'Atatürk', 'Barbaros', 'Esatpaşa', 'Ferhatpaşa', 'Fetih', 'İçerenköy', 'İnönü', 'Kayışdağı',
        'Küçükbakkalköy', 'Mevlana', 'Mimarsinan', 'Mustafa Kemal', 'Örnek', 'Yeniçamlıca', 'Yenişehir', 'Yenisahra'
    ],
    'Avcılar': [
        'Ambarlı', 'Cihangir', 'Denizköşkler', 'Firuzköy', 'Gümüşpala', 'Merkez', 'Mustafa Kemal Paşa',
        'Tahtakale', 'Üniversite', 'Yeşilkent'
    ],
    'Bağcılar': [
        '15 Temmuz', 'Bağlar', 'Barbaros', 'Çınar', 'Demirkapı', 'Fatih', 'Fevzi Çakmak', 'Göztepe', 'Güneşli',
        'Hürriyet', 'İnönü', 'Kâzım Karabekir', 'Kemalpaşa', 'Kirazlı', 'Mahmutbey', 'Merkez', 'Sancaktepe',
        'Yavuzselim', 'Yenigün', 'Yenimahalle', 'Yıldıztepe', 'Yüzyıl'
    ],
    'Bahçelievler': [
        'Bahçelievler', 'Cumhuriyet', 'Çobançeşme', 'Fevzi Çakmak', 'Hürriyet', 'Kocasinan', 'Siyavuşpaşa',
        'Soğanlı', 'Şirinevler', 'Yenibosna', 'Zafer'
    ],
    'Bakırköy': [
        'Ataköy 1. kısım', 'Ataköy 2-5-6. kısım', 'Ataköy 3-4-11. kısım', 'Ataköy 7-8-9-10. kısım', 'Basınköy',
        'Cevizlik', 'Kartaltepe', 'Osmaniye', 'Sakızağacı', 'Şenlikköy', 'Yenimahalle', 'Yeşilköy', 'Yeşilyurt',
        'Zeytinlik', 'Zuhuratbaba'
    ],
    'Başakşehir': [
        'Altınşehir', 'Bahçeşehir 1. Kısım', 'Bahçeşehir 2. Kısım', 'Başak', 'Başakşehir', 'Güvercintepe',
        'Kayabaşı', 'Şahintepe', 'Şamlar', 'Ziya Gökalp'
    ],
    'Bayrampaşa': [
        'Altıntepsi', 'Cevatpaşa', 'İsmetpaşa', 'Kartaltepe', 'Kocatepe', 'Muratpaşa', 'Orta', 'Terazidere',
        'Vatan', 'Yenidoğan', 'Yıldırım'
    ],
    'Beşiktaş': [
        'Abbasağa', 'Akat', 'Arnavutköy', 'Balmumcu', 'Bebek', 'Cihannüma', 'Dikilitaş', 'Etiler', 'Gayrettepe',
        'Konaklar', 'Kuruçeşme', 'Kültür', 'Levazım', 'Levent', 'Mecidiye', 'Muradiye', 'Nisbetiye', 'Ortaköy',
        'Sinanpaşa', 'Türkali', 'Ulus', 'Vişnezade', 'Yıldız'
    ],
    'Beykoz': [
        'Acarlar', 'Akbaba', 'Alibahadır', 'Anadolufeneri', 'Anadoluhisarı', 'Anadolukavağı', 'Baklacı', 'Bozhane',
        'Cumhuriyet', 'Çamlıbahçe', 'Çengeldere', 'Çiftlik', 'Çiğdem', 'Çubuklu', 'Dereseki', 'Elmalı', 'Fatih',
        'Göksu', 'Göllü', 'Görele', 'Göztepe', 'Gümüşsuyu', 'İncirköy', 'İshaklı', 'Kanlıca', 'Kavacık', 'Kaynarca',
        'Kılıçlı', 'Merkez', 'Mahmutşevketpaşa', 'Ortaçeşme', 'Öğümce', 'Örnekköy', 'Paşabahçe', 'Paşamandıra',
        'Polonezköy', 'Poyrazköy', 'Riva', 'Rüzgarlıbahçe', 'Soğuksu', 'Tokatköy', 'Yalıköy', 'Yavuzselim',
        'Yenimahalle', 'Zerzevatçı'
    ],
    'Beylikdüzü': [
        'Adnan Kahveci', 'Barış', 'Büyükşehir', 'Cumhuriyet', 'Dereağzı', 'Gürpınar', 'Kavaklı', 'Marmara',
        'Sahil', 'Yakuplu'
    ],
    'Beyoğlu': [
        'Arapcami', 'Asmalımescit', 'Bedrettin', 'Bereketzade', 'Bostan', 'Bülbül', 'Camiikebir', 'Cihangir',
        'Çatmamescit', 'Çukur', 'Emekyemez', 'Evliya Çelebi', 'Fetihtepe', 'Firuzağa', 'Gümüşsuyu', 'Hacıahmet',
        'Hacımimi', 'Halıcıoğlu', 'Hüseyinağa', 'İstiklal', 'Kadı Mehmet Efendi', 'Kamerhatun', 'Kalyoncukulluğu',
        'Kaptanpaşa', 'Katip Mustafa Çelebi', 'Keçecipiri', 'Kemankeş Kara Mustafa Paşa', 'Kılıçalipaşa',
        'Kocatepe', 'Kulaksız', 'Kuloğlu', 'Küçükpiyale', 'Müeyyetzade', 'Ömeravni', 'Örnektepe', 'Piripaşa',
        'Piyalepaşa', 'Pürtelaş', 'Sururi', 'Sütlüce', 'Şahkulu', 'Şehit Muhtar', 'Tomtom', 'Yahya Kahya', 'Yenişehir'
    ],
    'Büyükçekmece': [
        '19 Mayıs', 'Ahmediye', 'Alkent 2000', 'Atatürk', 'Bahçelievler', 'Celaliye', 'Cumhuriyet', 'Çakmaklı',
        'Dizdariye', 'Ekinoba', 'Fatih', 'Güzelce', 'Hürriyet', 'Kamiloba', 'Karaağaç', 'Kumburgaz', 'Mimaroba',
        'Mimarsinan', 'Muratçeşme', 'Pınartepe', 'Sinanoba', 'Türkoba', 'Ulus', 'Yenimahalle'
    ],
    'Çatalca': [
        'Akalan', 'Atatürk', 'Aydınlar', 'Bahşayiş', 'Başak', 'Belgrat', 'Celepköy', 'Çakıl', 'Çanakça',
        'Çiftlikköy', 'Dağyenice', 'Elbasan', 'Fatih', 'Ferhatpaşa', 'Gökçeali', 'Gümüşpınar', 'Hallaçlı',
        'Hisarbeyli', 'İhsaniye', 'İnceğiz', 'İzzettin', 'Kabakça', 'Kaleiçi', 'Kalfa', 'Karacaköy', 'Karamandere',
        'Kestanelik', 'Kızılcaali', 'Muratbey', 'Nakkaş', 'Oklalı', 'Ormanlı', 'Ovayenice', 'Örcünlü', 'Örencik',
        'Subaşı', 'Yalıköy', 'Yaylacık', 'Yazlık'
    ],
    'Çekmeköy': [
        'Alemdağ', 'Aydınlar', 'Cumhuriyet', 'Çamlık', 'Çatalmeşe', 'Ekşioğlu', 'Güngören', 'Hamidiye',
        'Hüseyinli', 'Kirazlıdere', 'Koçullu', 'Mehmet Akif', 'Merkez', 'Mimar Sinan', 'Nişantepe', 'Ömerli',
        'Reşadiye', 'Sırapınar', 'Soğukpınar', 'Sultançiftliği', 'Taşdelen'
    ],
    'Esenler': [
        '15 Temmuz', 'Birlik', 'Çiftehavuzlar', 'Davutpaşa', 'Fatih', 'Fevzi Çakmak', 'Havaalanı',
        'Kazım Karabekir', 'Kemer', 'Menderes', 'Mimar Sinan', 'Namık Kemal', 'Nenehatun', 'Oruçreis', 'Tuna',
        'Turgutreis', 'Yavuz Selim'
    ],
    'Esenyurt': [
        'Akçaburgaz', 'Akevler', 'Akşemseddin', 'Ardıçlı', 'Aşık Veysel', 'Atatürk', 'Bağlarçeşme', 'Balık Yolu',
        'Barbaros Hayrettin Paşa', 'Battalgazi', 'Cumhuriyet', 'Çınar', 'Esenkent', 'Fatih', 'Gökevler', 'Güzelyurt',
        'Hürriyet', 'İncirtepe', 'İnönü', 'İstiklal', 'Koza', 'Mehmet Akif Ersoy', 'Mehterçeşme', 'Mevlana',
        'Namık Kemal', 'Necip Fazıl Kısakürek', 'Orhan Gazi', 'Osmangazi', 'Örnek', 'Pınar', 'Piri Reis',
        'Saadetdere', 'Selahaddin Eyyubi', 'Sultaniye', 'Süleymaniye', 'Şehitler', 'Talatpaşa', 'Turgut Özal',
        'Üçevler', 'Yenikent', 'Yeşilkent', 'Yunus Emre', 'Zafer'
    ],
    'Eyüpsultan': [
        '5. Levent', 'Akşemsettin', 'Alibeyköy', 'Çırçır', 'Defterdar', 'Düğmeciler', 'Emniyettepe', 'Esentepe',
        'Merkez', 'Göktürk', 'Güzeltepe', 'İslambey', 'Karadolap', 'Mimarsinan', 'Mithatpaşa', 'Nişanca',
        'Rami Cuma', 'Rami Yeni', 'Sakarya', 'Silahtarağa', 'Topçular', 'Yeşilpınar'
    ],
    'Fatih': [
        'Aksaray', 'Akşemsettin', 'Alemdar', 'Ali Kuşçu', 'Atikali', 'Ayvansaray', 'Balabanağa', 'Balat',
        'Beyazıt', 'Binbirdirek', 'Cankurtaran', 'Cerrahpaşa', 'Cibali', 'Demirtaş', 'Derviş Ali', 'Eminsinan',
        'Hacıkadın', 'Hasekisultan', 'Hırkaişerif', 'Hobyar', 'Hoca Giyasettin', 'Hocapaşa', 'İskenderpaşa',
        'Kalenderhane', 'Karagümrük', 'Katip Kasım', 'Kemalpaşa', 'Kocamustafapaşa', 'Küçükayasofya', 'Mercan',
        'Mesihpaşa', 'Mevlanakapı', 'Mimar Hayrettin', 'Mimar Kemalettin', 'Mollafenari', 'Mollagürani',
        'Mollahüsrev', 'Muhsinehatun', 'Nişanca', 'Rüstempaşa', 'Saraçishak', 'Sarıdemir', 'Seyyid Ömer',
        'Silivrikapı', 'Sultanahmet', 'Sururi', 'Süleymaniye', 'Sümbülefendi', 'Şehremini', 'Şehsuvarbey',
        'Tahtakale', 'Tayahatun', 'Topkapı', 'Yavuzsinan', 'Yavuz Sultan Selim', 'Yedikule', 'Zeyrek'
    ],
    'Gaziosmanpaşa': [
        'Bağlarbaşı', 'Barbaros Hayrettin Paşa', 'Fevzi Çakmak', 'Hürriyet', 'Karadeniz', 'Karayolları',
        'Karlıtepe', 'Kâzım Karabekir', 'Merkez', 'Mevlana', 'Pazariçi', 'Sarıgöl', 'Şemsipaşa', 'Yenidoğan',
        'Yenimahalle', 'Yıldıztabya'
    ],
    'Güngören': [
        'Akıncılar', 'Abdurrahman Nafiz Gürman', 'Gençosman', 'Güneştepe', 'Güven', 'Haznedar',
        'Mareşal Fevzi Çakmak', 'Mehmet Nezih Özmen', 'Merkez', 'Sanayi', 'Tozkoparan'
    ],
    'Kadıköy': [
        '19 Mayıs', 'Acıbadem', 'Bostancı', 'Caddebostan', 'Caferağa', 'Dumlupınar', 'Eğitim', 'Erenköy',
        'Fenerbahçe', 'Feneryolu', 'Fikirtepe', 'Göztepe', 'Hasanpaşa', 'Koşuyolu', 'Kozyatağı', 'Merdivenköy',
        'Osmanağa', 'Rasimpaşa', 'Sahrayıcedid', 'Suadiye', 'Zühtüpaşa'
    ],
    'Kağıthane': [
        'Çağlayan', 'Çeliktepe', 'Gültepe', 'Emniyet Evleri', 'Gürsel', 'Hamidiye', 'Harmantepe', 'Hürriyet',
        'Mehmet Akif Ersoy', 'Merkez', 'Nurtepe', 'Ortabayır', 'Sultan Selim', 'Seyrantepe', 'Şirintepe',
        'Talatpaşa', 'Telsizler', 'Yahya Kemal', 'Yeşilce'
    ],
    'Kartal': [
        'Atalar', 'Cevizli', 'Cumhuriyet', 'Çavuşoğlu', 'Esentepe', 'Gümüşpınar', 'Hürriyet', 'Karlıktepe',
        'Kordonboyu', 'Orhantepe', 'Ortamahalle', 'Petrol-İş', 'Soğanlık', 'Topselvi', 'Uğur Mumcu',
        'Yakacık Çarşı', 'Yakacık Yeni', 'Yalı', 'Yukarımahalle', 'Yunus'
    ],
    'Küçükçekmece': [
        'Atakent', 'Atatürk', 'Beşyol', 'Cennet', 'Cumhuriyet', 'Fatih', 'Fevzi Çakmak', 'Gültepe', 'Halkalı',
        'İnönü', 'İstasyon', 'Kanarya', 'Kartaltepe', 'Kemalpaşa', 'Mehmet Akif', 'Söğütlüçeşme', 'Sultanmurat',
        'Tevfikbey', 'Yarımburgaz', 'Yenimahalle', 'Yeşilova'
    ],
    'Maltepe': [
        'Altayçeşme', 'Altıntepe', 'Aydınevler', 'Bağlarbaşı', 'Başıbüyük', 'Büyükbakkalköy', 'Cevizli', 'Çınar',
        'Esenkent', 'Feyzullah', 'Fındıklı', 'Girne', 'Gülensu', 'Gülsuyu', 'İdealtepe', 'Küçükyalı', 'Yalı',
        'Zümrütevler'
    ],
    'Pendik': [
        'Ahmet Yesevi', 'Bahçelievler', 'Batı', 'Çamçeşme', 'Çamlık', 'Çınardere', 'Doğu', 'Dumlupınar',
        'Ertuğrulgazi', 'Esenler', 'Esenyalı', 'Fatih', 'Fevzi Çakmak', 'Güllübağlar', 'Güzelyalı', 'Harmandere',
        'Kavakpınar', 'Kaynarca', 'Kurtköy', 'Orhangazi', 'Orta', 'Ramazanoğlu', 'Sanayi', 'Sapanbağları',
        'Sülüntepe', 'Şeyhli', 'Velibaba', 'Yayalar', 'Yenimahalle', 'Yenişehir', 'Yeşilbağlar'
    ],
    'Sancaktepe': [
        'Abdurrahmangazi', 'Akpınar', 'Atatürk', 'Emek', 'Eyüp Sultan', 'Fatih', 'Hilal', 'İnönü',
        'Kemal Türkler', 'Meclis', 'Merve', 'Mevlana', 'Osmangazi', 'Safa', 'Sarıgazi', 'Veysel Karani',
        'Yenidoğan', 'Yunus Emre'
    ],
    'Sarıyer': [
        'Ayazağa', 'Baltalimanı', 'Bahçeköy Kemer', 'Bahçeköy', 'Bahçeköy Yenimahalle', 'Büyükdere', 'Cumhuriyet',
        'Çayırbaşı', 'Darüşşafaka', 'Demirciköy', 'Derbent (Çamlıtepe)', 'Emirgân', 'Fatih Sultan Mehmet',
        'Ferahevler', 'Garipçe', 'İstinye', 'Kâzım Karabekir', 'Kireçburnu', 'Kocataş', 'Kumköy (Kilyos)',
        'Maden', 'Pınar', 'Poligon', 'PTT Evleri', 'Reşitpaşa', 'Rumelihisarı', 'Rumelifeneri', 'Rumelikavağı',
        'Maslak', 'Merkez', 'Tarabya', 'Uskumruköy', 'Yeniköy', 'Yenimahalle', 'Zekeriyaköy'
    ],
    'Silivri': [
        'Alibey', 'Alipaşa', 'Büyük Çavuşlu', 'Cumhuriyet', 'Çanta Fatih', 'Çanta Mimarsinan',
        'Değirmenköy İsmetpaşa', 'Değirmenköy Fevzipaşa', 'Fatih', 'Gazitepe (Haraççı)', 'Gümüşyaka', 'Kadıköy',
        'Kavaklı Hürriyet', 'Kavaklı Cumhuriyet', 'Küçük Kılıçlı', 'Mimar Sinan', 'Ortaköy', 'Piri Mehmet Paşa',
        'Selimpaşa', 'Semizkumlar', 'Yenimahalle', 'Yolçatı'
    ],
    'Sultanbeyli': [
        'Abdurrahmangazi', 'Adil', 'Ahmet Yesevi', 'Akşemsettin', 'Battalgazi', 'Fatih', 'Hamidiye', 'Hasanpaşa',
        'Mecidiye', 'Mehmet Akif', 'Mimarsinan', 'Necip Fazıl', 'Orhangazi', 'Turgutreis', 'Yavuz Selim'
    ],
    'Sultangazi': [
        '50. Yıl', '75. Yıl', 'Cebeci', 'Cumhuriyet', 'Esentepe', 'Eski Habibler', 'Gazi', 'Habibler',
        'İsmetpaşa', 'Malkoçoğlu', 'Sultançiftliği', 'Uğur Mumcu', 'Yayla', 'Yunusemre', 'Zübeydehanım'
    ],
    'Şile': [
        'Ağva', 'Balibey', 'Çavuş', 'Hacıkasım', 'Kumbaba'
    ],
    'Şişli': [
        '19 Mayıs', 'Bozkurt', 'Cumhuriyet', 'Duatepe', 'Ergenekon', 'Esentepe', 'Eskişehir', 'Feriköy', 'Fulya',
        'Gülbahar', 'Halaskargazi', 'Halide Edip Adıvar', 'Halil Rıfat Paşa', 'Harbiye', 'İnönü', 'İzzetpaşa',
        'Kaptanpaşa', 'Kuştepe', 'Mahmut Şevket Paşa', 'Mecidiyeköy', 'Merkez', 'Meşrutiyet', 'Paşa',
        'Teşvikiye', 'Yayla'
    ],
    'Tuzla': [
        'Akfırat', 'Anadolu', 'Aydınlı', 'Aydıntepe', 'Cami', 'Evliya Çelebi', 'Fatih', 'İçmeler', 'İstasyon',
        'Mescit', 'Mimar Sinan', 'Orhanlı', 'Orta', 'Postane', 'Şifa', 'Tepeören', 'Yayla'
    ],
    'Ümraniye': [
        'Adem Yavuz', 'Altınşehir', 'Armağanevler', 'Aşağıdudullu', 'Atakent', 'Atatürk', 'Cemil Meriç',
        'Çakmak', 'Çamlık', 'Dumlupınar', 'Elmalıkent', 'Esenevler', 'Esenkent', 'Esenşehir',
        'Fatih Sultan Mehmet', 'Finanskent', 'Hekimbaşı', 'Huzur', 'Ihlamurkuyu', 'İnkılap', 'İstiklal',
        'Kâzım Karabekir', 'Madenler', 'Mehmet Akif', 'Namık Kemal', 'Necip Fazıl', 'Parseller', 'Site',
        'Şerifali', 'Tantavi', 'Tatlısu', 'Tepeüstü', 'Topağacı', 'Yamanevler', 'Yukarıdudullu'
    ],
    'Üsküdar': [
        'Acıbadem', 'Ahmediye', 'Altunizade', 'Aziz Mahmud Hüdayi', 'Bahçelievler', 'Barbaros', 'Beylerbeyi',
        'Bulgurlu', 'Burhaniye', 'Cumhuriyet', 'Çengelköy', 'Ferah', 'Güzeltepe', 'İcadiye', 'Kandilli',
        'Kirazlıtepe', 'Kısıklı', 'Kuleli', 'Kuzguncuk', 'Küçük Çamlıca', 'Küçüksu', 'Küplüce',
        'Mehmet Akif Ersoy', 'Mimar Sinan', 'Murat Reis', 'Salacak', 'Selami Ali', 'Selimiye', 'Sultantepe',
        'Ünalan', 'Valide-i Atik', 'Yavuztürk', 'Zeynep Kamil'
    ],
    'Zeytinburnu': [
        'Beştelsiz', 'Çırpıcı', 'Gökalp', 'Kazlıçeşme', 'Maltepe', 'Merkezefendi', 'Nuripaşa', 'Seyitnizam',
        'Sümer', 'Telsiz', 'Veliefendi', 'Yenidoğan', 'Yeşiltepe'
    ]
};

export const getNeighborhoods = (district: string) => {
    return NEIGHBORHOODS[district] || [];
};