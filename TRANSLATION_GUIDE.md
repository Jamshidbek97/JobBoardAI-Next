# 🌍 Translation Guide for JobBoard AI

## **Overview**

This guide explains how to properly implement translations in the JobBoard AI application, specifically for the notification system and other components.

## **📁 Translation Files Structure**

```
public/locales/
├── en/
│   └── common.json          # English translations
├── kr/
│   └── common.json          # Korean translations
└── ru/
    └── common.json          # Russian translations
```

## **🔧 How to Use Translations**

### **1. Basic Translation Usage**

```typescript
import { useTranslation } from 'next-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return <div>{t('Hello World')}</div>;
};
```

### **2. Using Translation Utilities**

```typescript
import { useTranslationUtils } from '../libs/utils/translationUtils';

const MyComponent = () => {
  const { t, formatTimeAgo, formatCurrency, interpolate } = useTranslationUtils();
  
  // Format time with localization
  const timeAgo = formatTimeAgo('2024-01-15T10:30:00Z');
  
  // Format currency with localization
  const salary = formatCurrency(50000, 'KRW');
  
  // Interpolate with variables
  const message = interpolate('Are you sure you want to delete {count} items?', { count: 5 });
  
  return <div>{message}</div>;
};
```

### **3. Dynamic Content Translation**

For notification messages and other dynamic content:

```typescript
// ✅ Good - Use translation keys
const notificationData = createJobApplicationNotification(
  recipientId,
  senderId,
  jobId,
  jobTitle,
  applicantName,
  t // Pass translation function
);

// ❌ Bad - Hardcoded English text
const notificationData = {
  title: 'New Job Application Received', // Hardcoded
  message: `${applicantName} has applied for your job posting: ${jobTitle}`
};
```

## **📝 Adding New Translation Keys**

### **1. Add to English (en/common.json)**

```json
{
  "New Feature": "New Feature",
  "Welcome message": "Welcome message",
  "Delete confirmation": "Are you sure you want to delete {count} items?"
}
```

### **2. Add to Korean (kr/common.json)**

```json
{
  "New Feature": "새 기능",
  "Welcome message": "환영 메시지",
  "Delete confirmation": "{count}개의 항목을 삭제하시겠습니까?"
}
```

### **3. Add to Russian (ru/common.json)**

```json
{
  "New Feature": "Новая функция",
  "Welcome message": "Приветственное сообщение",
  "Delete confirmation": "Вы уверены, что хотите удалить {count} элементов?"
}
```

## **🎯 Best Practices**

### **1. Use Translation Keys Instead of Hardcoded Text**

```typescript
// ✅ Good
<Typography>{t('Notifications')}</Typography>

// ❌ Bad
<Typography>Notifications</Typography>
```

### **2. Handle Pluralization**

```typescript
// ✅ Good - Use interpolation
const message = interpolate('{count} notification(s)', { count: 5 });

// ❌ Bad - Hardcoded pluralization
const message = count === 1 ? '1 notification' : `${count} notifications`;
```

### **3. Format Dates and Numbers Locally**

```typescript
// ✅ Good - Use utility functions
const { formatTimeAgo, formatCurrency } = useTranslationUtils();
const timeAgo = formatTimeAgo(dateString);
const salary = formatCurrency(50000, 'KRW');

// ❌ Bad - Hardcoded formatting
const timeAgo = '2 hours ago';
const salary = '₩50,000';
```

### **4. Handle Dynamic Content**

```typescript
// ✅ Good - Use translation templates
const message = `${applicantName} ${t('has applied for your job posting')}: ${jobTitle}`;

// ❌ Bad - Hardcoded dynamic content
const message = `${applicantName} has applied for your job posting: ${jobTitle}`;
```

## **🔍 Common Translation Patterns**

### **1. Error Messages**

```json
{
  "Failed to load": "Failed to load",
  "Please try again": "Please try again",
  "Something went wrong": "Something went wrong"
}
```

### **2. Success Messages**

```json
{
  "Successfully saved": "Successfully saved",
  "Operation completed": "Operation completed",
  "Changes applied": "Changes applied"
}
```

### **3. Confirmation Dialogs**

```json
{
  "Are you sure": "Are you sure",
  "This action cannot be undone": "This action cannot be undone",
  "Cancel": "Cancel",
  "Confirm": "Confirm"
}
```

### **4. Time and Date**

```json
{
  "Just now": "Just now",
  "ago": "ago",
  "minute": "minute",
  "minutes": "minutes",
  "hour": "hour",
  "hours": "hours",
  "day": "day",
  "days": "days"
}
```

## **🚀 Testing Translations**

### **1. Switch Languages**

```typescript
import { useRouter } from 'next/router';

const LanguageSwitcher = () => {
  const router = useRouter();
  
  const changeLanguage = (locale: string) => {
    router.push(router.asPath, router.asPath, { locale });
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('kr')}>한국어</button>
      <button onClick={() => changeLanguage('ru')}>Русский</button>
    </div>
  );
};
```

### **2. Check for Missing Translations**

```typescript
// Add this to your component to see missing keys
const { t } = useTranslation('common');

// This will show the key if translation is missing
console.log(t('Some Key That Might Not Exist'));
```

## **📋 Translation Checklist**

When adding new features, ensure you:

- [ ] Add translation keys to all language files (en, kr, ru)
- [ ] Use `t()` function instead of hardcoded text
- [ ] Handle dynamic content with interpolation
- [ ] Format dates, times, and numbers locally
- [ ] Test with different languages
- [ ] Check for missing translations
- [ ] Use consistent key naming conventions
- [ ] Handle pluralization properly

## **🔧 Troubleshooting**

### **Common Issues**

1. **Translation not showing**: Check if the key exists in all language files
2. **Wrong language showing**: Verify the locale is set correctly
3. **Dynamic content not translated**: Use interpolation instead of string concatenation
4. **Date/number formatting issues**: Use the utility functions for proper localization

### **Debugging**

```typescript
// Enable translation debugging
const { t, i18n } = useTranslation('common');
console.log('Current language:', i18n.language);
console.log('Available languages:', i18n.languages);
console.log('Translation key:', t('some.key'));
```

## **📚 Additional Resources**

- [Next.js i18n Documentation](https://nextjs.org/docs/advanced-features/i18n-routing)
- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [i18next Documentation](https://www.i18next.com/)
