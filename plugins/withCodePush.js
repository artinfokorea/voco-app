const {
  withAppBuildGradle,
  withMainApplication,
  withStringsXml,
  createRunOncePlugin,
  withAndroidAppBuildGradle,
} = require('@expo/config-plugins');

const withCodePushAndroidBuildGradle = (config) => {
  return withAppBuildGradle(config, (config) => {
    console.log(
      'withCodePushAndroidBuildGradle: language =',
      config.modResults.language
    );
    if (config.modResults.language === 'groovy') {
      const contents = config.modResults.contents;
      const pattern = /apply plugin: "com.facebook.react"/;
      const codePushGradle =
        'apply from: "../../node_modules/react-native-code-push/android/codepush.gradle"';

      if (contents.includes('codepush.gradle')) {
        console.log('CodePush gradle already present');
        return config;
      }

      if (contents.match(pattern)) {
        console.log('Found pattern match in build.gradle');
        config.modResults.contents = contents.replace(
          pattern,
          `apply plugin: "com.facebook.react"\n${codePushGradle}`
        );
      } else {
        console.log('Pattern NOT found in build.gradle');
        // Try alternate pattern or append
        const alternate = /apply plugin: 'com.facebook.react'/;
        if (contents.match(alternate)) {
          console.log('Found alternate pattern');
          config.modResults.contents = contents.replace(
            alternate,
            `apply plugin: 'com.facebook.react'\n${codePushGradle}`
          );
        } else {
          // Fallback: append after org.jetbrains.kotlin.android if present
          const fallback = /apply plugin: "org.jetbrains.kotlin.android"/;
          if (contents.match(fallback)) {
            console.log('Found fallback pattern');
            config.modResults.contents = contents.replace(
              fallback,
              `apply plugin: "org.jetbrains.kotlin.android"\n${codePushGradle}`
            );
          } else {
            console.warn(
              'Could not find a place to inject CodePush gradle in app/build.gradle, appending to top'
            );
            config.modResults.contents = `${codePushGradle}\n${contents}`;
          }
        }
      }
    }
    return config;
  });
};

const withCodePushMainApplication = (config) => {
  return withMainApplication(config, (config) => {
    console.log(
      'withCodePushMainApplication: language =',
      config.modResults.language
    );
    if (config.modResults.language === 'kotlin') {
      let contents = config.modResults.contents;
      const importLine = 'import com.microsoft.codepush.react.CodePush';

      if (!contents.includes(importLine)) {
        console.log('Injecting import into MainApplication.kt');
        contents = contents.replace(
          /import com.facebook.react.ReactApplication/,
          `import com.facebook.react.ReactApplication\n${importLine}`
        );
      }

      const overrideMethod = `
          override fun getJSBundleFile(): String {
            return CodePush.getJSBundleFile()
          }
      `;

      if (!contents.includes('CodePush.getJSBundleFile()')) {
        console.log('Injecting getJSBundleFile into MainApplication.kt');
        // Look for the creation of DefaultReactNativeHost
        // We want to insert the override inside the object : DefaultReactNativeHost(this) { ... }
        // We can find `override fun getJSMainModuleName` and insert before or after it.

        if (contents.includes('override fun getJSMainModuleName(): String')) {
          contents = contents.replace(
            /override fun getJSMainModuleName\(\): String = .*/,
            (match) => `${match}\n\n${overrideMethod}`
          );
        } else {
          console.warn(
            'Could not find getJSMainModuleName to inject getJSBundleFile'
          );
        }
      }
      config.modResults.contents = contents;
    } else if (config.modResults.language === 'java') {
      // Fallback for Java if needed (unlikely in new Expo)
    }
    return config;
  });
};

const withCodePushStrings = (config, props) => {
  return withStringsXml(config, (config) => {
    const androidKey = props.android?.CodePushDeploymentKey;
    if (androidKey) {
      const strings = config.modResults.resources.string || [];
      if (!strings.find((s) => s.$.name === 'CodePushDeploymentKey')) {
        strings.push({
          $: { name: 'CodePushDeploymentKey', moduleConfig: 'true' },
          _: androidKey,
        });
        config.modResults.resources.string = strings;
      }
    }
    return config;
  });
};

const withCodePush = (config, props = {}) => {
  config = withCodePushAndroidBuildGradle(config);
  config = withCodePushMainApplication(config);
  config = withCodePushStrings(config, props);
  return config;
};

module.exports = createRunOncePlugin(withCodePush, 'withCodePush', '1.0.0');
