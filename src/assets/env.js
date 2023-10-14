(function() {
    console.log('env.js', window)
    window["env"] = window["env"] || {};
    window["env"]["sentryDns"] = "https://some-host.com";
    window["env"]["appTitle"] = "Tabbled";
    window["env"]["appFavicon"] = "/favicon.png";
})();