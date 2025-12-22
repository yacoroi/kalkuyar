try {
    const { getDefaultConfig } = require("expo/metro-config");
    const { withNativeWind } = require("nativewind/metro");
    console.log('Success: modules loaded');
    const config = getDefaultConfig(__dirname);
    console.log('Success: config generated');
    const final = withNativeWind(config, { input: "./global.css" });
    console.log('Success: final config created');
} catch (e) {
    console.error('Error:', e);
}
