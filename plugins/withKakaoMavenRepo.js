const {
  withProjectBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const withKakaoMavenRepo = (config) => {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    const kakaoMavenRepo = `maven { url 'https://devrepo.kakao.com/nexus/content/groups/public/' }`;

    // Check if already added
    if (contents.includes('devrepo.kakao.com')) {
      console.log('Kakao Maven repository already present');
      return config;
    }

    // Find the allprojects { repositories { ... } } block and add the Kakao repo
    const allProjectsPattern = /(allprojects\s*\{[\s\S]*?repositories\s*\{)/;

    if (contents.match(allProjectsPattern)) {
      console.log('Adding Kakao Maven repository to allprojects repositories');
      config.modResults.contents = contents.replace(
        allProjectsPattern,
        `$1\n    ${kakaoMavenRepo}`
      );
    } else {
      console.warn('Could not find allprojects repositories block');
    }

    return config;
  });
};

module.exports = createRunOncePlugin(
  withKakaoMavenRepo,
  'withKakaoMavenRepo',
  '1.0.0'
);
