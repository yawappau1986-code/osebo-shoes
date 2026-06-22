# Dark Mode Testing Guide 🌙

## Quick Start

### 1. Run the App
```bash
npx expo start
```

### 2. Access Dark Mode Toggle
The dark mode toggle is located in the **Account Modal**:

1. Open the app
2. **If not signed in**: Click "bag" icon → Sign in first
3. **Once signed in**: Tap your account button/name in the header
4. Account modal opens → Look for **moon/sun toggle** in the header (right side)
5. Tap the toggle to switch modes

---

## What Changes in Dark Mode

### Background Colors
- **Light Mode**: Off-white (#FAF9F9)
- **Dark Mode**: Soft dark (#121212) - not pure black

### Shopping Page
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | #FAF9F9 | #121212 |
| Product Cards | #FFFFFF | #1E1E1E |
| Text | #1B1C1C | #E8EAED |
| Prices | #4A0404 | #D26A5F |
| Category Chips | White with gray border | #1E1E1E with dark border |
| Search Bar | White | #1E1E1E |

### Cart Modal
- Background: White → Dark (#121212)
- Cart items: Light gray → Dark surface (#1E1E1E)
- Text: Dark → Light
- Buttons maintain brand color but adjusted for contrast

### Checkout Page
- Modal background: Light → Dark
- Input fields: White → Dark surface
- All text readable with adjusted colors

### Product Detail Modal
- All sections respond to dark mode
- Image gallery background stays dark (works well in both modes)
- Product info, weights, quantity controls all styled

---

## Testing Checklist

### Basic Functionality
- [ ] Toggle switches from light to dark mode
- [ ] Toggle switches back from dark to light mode
- [ ] Moon icon shows in light mode
- [ ] Sun icon shows in dark mode

### Shopping Page
- [ ] Products visible and readable
- [ ] Category chips readable
- [ ] Search bar functional and readable
- [ ] Product prices visible
- [ ] Product descriptions readable
- [ ] Product images display correctly
- [ ] Cart icon badge visible

### Cart
- [ ] Cart items visible
- [ ] Product names readable
- [ ] Prices visible
- [ ] Quantity controls (+/-) visible
- [ ] Total amount readable
- [ ] Checkout button visible

### Checkout
- [ ] Form inputs visible
- [ ] Placeholder text visible
- [ ] Entered text readable
- [ ] Labels readable
- [ ] Buttons visible

### Product Detail
- [ ] Product name readable
- [ ] Price visible
- [ ] Description readable
- [ ] Size/weight buttons visible
- [ ] Quantity controls visible
- [ ] Add to cart button visible

### Account Modal
- [ ] Order history readable
- [ ] Order items visible
- [ ] Status badges visible
- [ ] Dark mode toggle visible and functional
- [ ] Sign out button visible

---

## Expected Console Logs

When you toggle dark mode, you won't see specific logs, but the UI should change instantly. Check for:
- No errors in console
- Smooth transition between modes
- All text remains readable

---

## Common Issues & Solutions

### Issue: Toggle button not visible
**Solution**: Make sure you're logged in. Toggle is in the account modal which requires authentication.

### Issue: Some elements still light/dark
**Solution**: Refresh the app. Hot reload sometimes misses style updates.

### Issue: Text not readable
**Solution**: Check contrast - all text should be visible. If not, report the specific component.

### Issue: Dark mode resets on app restart
**Expected behavior**: Dark mode preference is not persisted yet. It will reset to light mode on app restart.

---

## Advanced Testing

### Test Different Scenarios
1. **Light → Dark → Light**: Toggle multiple times
2. **Dark mode + Add to cart**: Test cart functionality in dark mode
3. **Dark mode + Checkout**: Complete full checkout flow
4. **Dark mode + Product details**: View multiple products
5. **Dark mode + Account orders**: Check order history visibility

### Test on Different Devices
- [ ] Small phone (320-375px width)
- [ ] Medium phone (375-414px width)
- [ ] Large phone (414-480px width)
- [ ] Tablet (768px+ width)

### Test in Different Lighting
- [ ] Bright sunlight (prefer light mode)
- [ ] Indoor lighting (both modes comfortable)
- [ ] Night/dark room (dark mode should be easy on eyes)

---

## Screenshots Recommendations

Take screenshots of:
1. Light mode shopping page
2. Dark mode shopping page
3. Light mode cart
4. Dark mode cart
5. Dark mode toggle button location
6. Product detail in dark mode

---

## Performance Notes

- Dark mode uses inline style checks: `isUserDarkMode ? darkColor : lightColor`
- No performance impact - renders instantly
- State is simple boolean, very lightweight
- No async operations or API calls

---

## Next Steps (Optional Enhancements)

### Persistence
Add AsyncStorage to save preference:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// On toggle
const toggleDarkMode = async () => {
  const newMode = !isUserDarkMode;
  setIsUserDarkMode(newMode);
  await AsyncStorage.setItem('userDarkMode', JSON.stringify(newMode));
};

// On app load
useEffect(() => {
  const loadDarkMode = async () => {
    const saved = await AsyncStorage.getItem('userDarkMode');
    if (saved !== null) {
      setIsUserDarkMode(JSON.parse(saved));
    }
  };
  loadDarkMode();
}, []);
```

### System Default
Detect system preference:
```javascript
import { useColorScheme } from 'react-native';

const systemTheme = useColorScheme(); // 'light' or 'dark'
```

### Animation
Add smooth transition:
```javascript
import Animated, { FadeIn } from 'react-native-reanimated';

<Animated.View entering={FadeIn}>
  {/* Dark mode content */}
</Animated.View>
```

---

## Support

If you encounter issues:
1. Check console for errors
2. Try refreshing the app (shake device → Reload)
3. Check that you're signed in (for account modal access)
4. Verify expo version is up to date

Happy testing! 🌙✨
