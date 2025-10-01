# Product Context Chat - Quick Reference 🚀

## 🎯 What It Does
When users click "Contact Seller" on a product page, the chat automatically opens with a pre-filled message containing:
- Product name
- Product price
- Product ID
- Professional inquiry message

## 📝 Example Output

**Input**: User clicks "Contact Seller" on "Samsung Galaxy S21" (UGX 1,200,000)

**Auto-filled message**:
```
Hi! I'm interested in this product:

Product: Samsung Galaxy S21 - UGX 1200000
Product ID: 123

Could you provide more details?
```

## 🔧 Usage in Code

### For Product Pages
```tsx
<ContactSellerButton
  productId={product.id}
  productName={product.name}
  productPrice={product.price_2 || product.price_1}
  sellerId={product.user}
>
  Contact Seller
</ContactSellerButton>
```

### Generated URL
```
/account/chats?chatId=42&productId=123&productName=Samsung%20Galaxy%20S21&productPrice=1200000
```

## ⌨️ Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line

## ✅ Features

1. ✅ Auto-fills message with product details
2. ✅ Focuses message input automatically
3. ✅ Cursor positioned at end of text
4. ✅ Works on both desktop and mobile
5. ✅ Backward compatible (works without product params)
6. ✅ URL encoding handles special characters
7. ✅ Professional message format

## 🎨 User Experience

**Before**: User types manually about product  
**After**: Message pre-filled, just hit send or edit

**Time saved**: ~30 seconds per inquiry  
**Error reduction**: No typos in product details  
**Professional**: Consistent, clear communication

---

**Status**: ✅ Production Ready  
**Last Updated**: October 1, 2025
