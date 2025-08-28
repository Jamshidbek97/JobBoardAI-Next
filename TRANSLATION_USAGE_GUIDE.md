# Translation Usage Guide for JobBoard AI

## 🚀 Quick Start

Your translation system is already set up and working! Here's how to use it:

### 1. **Basic Translation Usage**

```tsx
import { useTranslation } from 'next-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('Welcome')}</h1>
      <p>{t('This is a translated text')}</p>
    </div>
  );
};
```

### 2. **Using Translation Utilities**

```tsx
import { useTranslationUtils } from '../../libs/utils/translationUtils';

const MyComponent = () => {
  const { t, formatTimeAgo, formatCurrency, interpolate } = useTranslationUtils();
  
  return (
    <div>
      <p>{t('Posted')} {formatTimeAgo('2024-01-15T10:30:00Z')}</p>
      <p>{formatCurrency(50000)}</p>
      <p>{interpolate('Hello {name}', { name: 'John' })}</p>
    </div>
  );
};
```

### 3. **Standalone Utility Functions**

```tsx
import { formatDate, formatNumber } from '../../libs/utils/translationUtils';

const MyComponent = () => {
  return (
    <div>
      <p>{formatDate('2024-01-15')}</p>
      <p>{formatNumber(1234567)}</p>
    </div>
  );
};
```

## 🌍 Language Switching

### **Current Implementation**
Your app already has a language switcher in the top navigation that supports:
- 🇺🇸 English (en)
- 🇰🇷 Korean (kr) 
- 🇷🇺 Russian (ru)

### **How It Works**
1. Click the language flag in the top navigation
2. Select your preferred language
3. The page will reload with the new language
4. Your preference is saved in localStorage

## 📝 Adding New Translation Keys

### **1. Add to English (en/common.json)**
```json
{
  "New Key": "New Value",
  "Welcome Message": "Welcome to our platform!"
}
```

### **2. Add to Korean (kr/common.json)**
```json
{
  "New Key": "새 값",
  "Welcome Message": "우리 플랫폼에 오신 것을 환영합니다!"
}
```

### **3. Add to Russian (ru/common.json)**
```json
{
  "New Key": "Новое значение",
  "Welcome Message": "Добро пожаловать на нашу платформу!"
}
```

## 🔧 Translation Utilities

### **Available Functions**

#### **useTranslationUtils Hook**
- `t(key)` - Basic translation
- `formatTimeAgo(dateString)` - "2 hours ago", "3 days ago"
- `formatCurrency(amount, currency)` - Localized currency formatting
- `interpolate(key, variables)` - Dynamic content with variables
- `getNotificationTypeLabel(type)` - Notification type labels

#### **Standalone Functions**
- `formatDate(dateString, locale)` - Localized date formatting
- `formatNumber(number, locale)` - Localized number formatting
- `pluralize(count, singular, plural)` - Pluralization helper

### **Examples**

```tsx
// Time formatting
formatTimeAgo('2024-01-15T10:30:00Z') // "2 hours ago"

// Currency formatting
formatCurrency(50000) // "$50,000" (EN), "₩50,000" (KR), "50 000 ₽" (RU)

// Dynamic content
interpolate('Hello {name}, you have {count} messages', { 
  name: 'John', 
  count: 5 
})

// Date formatting
formatDate('2024-01-15') // "Jan 15, 2024" (EN), "2024년 1월 15일" (KR)

// Number formatting
formatNumber(1234567) // "1,234,567" (EN), "1,234,567" (KR), "1 234 567" (RU)
```

## 🎯 Best Practices

### **1. Use Translation Keys**
✅ **Good:**
```tsx
{t('Welcome Message')}
```

❌ **Bad:**
```tsx
"Welcome Message" // Hardcoded text
```

### **2. Use Interpolation for Dynamic Content**
✅ **Good:**
```tsx
interpolate('Hello {name}', { name: userName })
```

❌ **Bad:**
```tsx
`Hello ${userName}` // String concatenation
```

### **3. Use Utility Functions for Formatting**
✅ **Good:**
```tsx
formatCurrency(salary)
formatTimeAgo(createdAt)
```

❌ **Bad:**
```tsx
`$${salary}` // Manual formatting
```

### **4. Handle Missing Keys Gracefully**
```tsx
// The t() function will return the key if translation is missing
// You can also provide fallbacks:
{t('Some Key') || 'Fallback Text'}
```

## 🧪 Testing Translations

### **1. Switch Languages**
- Use the language switcher in the navigation
- Check that all text changes appropriately
- Verify that formatting (dates, numbers, currency) is localized

### **2. Check for Missing Keys**
- Open browser console
- Look for warnings about missing translation keys
- Add missing keys to all language files

### **3. Test Dynamic Content**
- Test with different user data
- Verify interpolation works correctly
- Check that pluralization works

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Translation Not Working**
- Check that the key exists in all language files
- Verify you're using `useTranslation('common')`
- Ensure the component is wrapped with `appWithTranslation`

#### **2. Language Not Switching**
- Check browser console for errors
- Verify `next-i18next.config.js` is configured correctly
- Clear localStorage and try again

#### **3. Formatting Issues**
- Check that utility functions are imported correctly
- Verify locale is being passed correctly
- Test with different locales

### **Debug Mode**
Enable debug mode to see missing translations:

```tsx
// In your component
const { t } = useTranslation('common', {
  useSuspense: false,
  debug: true // This will log missing keys
});
```

## 📚 Additional Resources

- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [i18next Documentation](https://www.i18next.com/)
- [React i18next Documentation](https://react.i18next.com/)

## 🎉 Your Translation System is Ready!

Your JobBoard AI application now has a fully functional translation system with:
- ✅ 3 languages (English, Korean, Russian)
- ✅ Language switcher in navigation
- ✅ Comprehensive translation utilities
- ✅ Dynamic content support
- ✅ Localized formatting for dates, numbers, and currency
- ✅ Notification system translations
- ✅ Application management translations

Start using `t()` for all your text content and enjoy a fully internationalized application! 🌍
