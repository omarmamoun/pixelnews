# تشغيل منصة ظاهر عبر PHP

## الخيار الموصى به

ضع PHP بحيث يكون الملف موجوداً في:

```text
C:\php\php.exe
```

ثم افتح CMD داخل مجلد المشروع وشغّل:

```cmd
start-php-server.cmd
```

افتح الموقع من نفس الجهاز:

```text
http://localhost:8081
```

يكتشف `start-php-server.cmd` PHP المثبت مع XAMPP في `C:\xampp\php\php.exe` ويحمّل Sodium عند التشغيل. ينشئ مفتاح تشفير محلياً ثابتاً ومخزن الحسابات المشفر خارج المشروع في `%LOCALAPPDATA%\PixelNews` عند أول تشغيل. يضبط حدود PHP المحلية لرفع الفيديو إلى 50 ميجابايت مع هامش لبيانات النموذج. افتح الموقع عبر `http://localhost:8081`، وليس بفتح ملفات HTML مباشرة، وأعد تشغيل الخادم بعد تغيير إعداداته. غيّر المنفذ بتعيين `PIXELNEWS_PORT` قبل تشغيل السكربت.

ومن جهاز آخر على نفس Wi-Fi:

```text
http://192.168.100.33:8081
```

## إذا كان PHP مثبتاً في مكان آخر

شغّل:

```cmd
where php
php -v
```

أو عدّل مسار `PHP_EXE` داخل `start-php-server.cmd`.

## إعدادات PHP المطلوبة

فعّل في `php.ini`:

```ini
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=sodium
```

## تغيير كلمة مرور Owner بدون بريد

من CMD شغّل أداة المطور المحلية:

```cmd
php tools\set-owner-password.php
```

اكتب كلمة المرور عند الطلب، ثم ضع قيمة `ZAHER_OWNER_PASSWORD_HASH` التي يطبعها السكربت في إعدادات الخادم. لا تفتح هذه الأداة عبر المتصفح ولا ترفعها إلى رابط عام.

ثم أعد تشغيل خادم PHP.

## ملاحظات

- لا تستخدم `dev-server.ps1` لتجربة تسجيل الدخول؛ هو يعرض الملفات فقط ولا يشغّل PHP.
- تخزين الحسابات الحقيقي هو `api/Save-Data` وليس مجلد `Save-Data` الموجود في جذر المشروع.
- لا ترفع مفاتيح التشفير أو ملفات `.pfx` إلى Git أو الاستضافة العامة.
