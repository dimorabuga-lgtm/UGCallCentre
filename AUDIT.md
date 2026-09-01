# Production Audit — UG Call Centre

## Виявлені проблеми
- `manifest.json`, `robots.txt` і `sitemap.xml` були порожніми.
- У `index.html` не було canonical, Open Graph, Twitter Card, favicon-підключення, `theme-color` і JSON-LD Organization.
- Локальні JavaScript-модулі завантажувалися без `defer`.
- Footer не містив повної навігації, CTA, адаптивної мобільної дії та кнопки повернення нагору.

## Виправлення
- У `index.html` додано SEO-метадані, JSON-LD, favicon, manifest і `defer` для скриптів.
- Заповнено `manifest.json` та `robots.txt`; `sitemap.xml` збережено валідним без вигаданого домену.
- У `js/navigation.js` додано доступну кнопку повернення нагору та приховування мобільної CTA-панелі біля форми.
- У `css/sections.css` додано адаптивний footer з safe-area відступом для мобільної панелі.

## Дані, що потребують підключення
- Production API форми: `js/forms.js` містить `FormSubmit endpoint configured`.
- Фактичні Telegram, Viber, телефон, юридичні сторінки та остаточні контакти залишаються заповнювачами.
- Перед публікацією додайте домен у canonical, Open Graph URL, `robots.txt` і абсолютні URL у `sitemap.xml`.

## Перед публікацією
- Замініть placeholder-контакти та посилання `#` на реальні.
- Підключіть HTTPS endpoint форми з серверною валідацією та захистом від спаму.
- Перевірте сторінку в Lighthouse і на реальних мобільних пристроях після деплою.
