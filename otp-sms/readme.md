kullanıcı bilgilerinizi api işlemini yapan kişiye bildirmeniz gerekmektedir...

APİ DEN SMS GÖNDERİMİ...

 


ekteki xml api için post adresi http://g.iletimx.com

bayi kodu 3408

Merhaba ekte api dökümanı mevcuttur. ayrıca türkçe gönderim yapacaksanız aşağıdaki işlemleri uygulayabilirsiniz.
ayrıca web servis api linkimiz. http://g.iletimx.com/sms_soap/sms.asmx
ayrıca dilerseniz smpp protokolü ile de gönderim yapabilirsiniz.

api ile türkçe karakter göndermek için

örnek xml
<MainmsgBody><UserName>test-1111</UserName><PassWord>aaaa</PassWord><Action>12</Action><Mesgbody><![CDATA[ışİŞöÖçÇüÜ1234567890123344567890sonışık]]></Mesgbody><Numbers>05060662966</Numbers><Originator>Osman Test</Originator><SDate></SDate></MainmsgBody>

normal gönderim işleminde kullandığımız action 0 (tek mesajın çok kişiye gönderilmesi) yerine action kodu 12 girilecek
normal de kişiye özel mesaj için kullandığımız action 1 yerine de action 13 girilecek.

uzun mesajların ve normal mesajların ücretlendirilmesi
single shift diye bahsettiğimiz mesajlar 155 karakter uzunluğundadır (5 karakter mesajın türkçe olduğunu belirmek için harcanmaktadır.)
kullanılan normal karakterler 1 karakter harcarken , türkçe karakterler 2 karakter harcamaktadır. örneğin tarım kelimesi 1 adet türkçe 4 adet normal karakter olduğu için 6 karakter olarak yer kaplamaktadır.

uzun mesajlarda 155 karakteri geçen mesajlarda mesajlar 149 ve katları şeklince parçalanarak ücretlendirilmektedir.

155 karaktere kadar 1 sms olarak gönderilir.
155 karakterden 298 karaktere kadar 2 sms olarak gönderilir.
298 karakterden 447 karaktere kadar 3 sms olarak gönderilir.
447 karakterden 596 karaktere kadar 4 sms olarak gönderilir.
596 karakterden 745 karaktere kadar 5 sms olarak gönderilir.


2 karakter düşen karakterler Ş , ş , Ğ , ğ , ç , ı , İ
Ç, ö, Ö , ü , Ü  harfi tek karakterdir çünkü gsm 7 bit standardında bulunmaktadır.
ayrıca yine gsm 7 bit genişleme tablosunda bulunan ^ { } \ [ ] ~ | € karakterleride 2 karakter yerine geçmektedir.
bu yöntemle gönderilen türkçe karakterli mesajlar 2008 ve daha eski model telefonlarda S , s , G , g , c , i , I olarak yani en yakın latin karakter olarak gözükmektedir (telefon desteklemediği için).

sorularınız için 0532 504 15 51 den ulaşabilirsiniz. Türkçe karakterli xml i post ederken UTF-8 encoding ile post ederseniz karakter sıkıntısı yaşamamış oluruz.
