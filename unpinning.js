Java.perform(function () {
    // SSL Pinning Bypass Logic
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');

    var TrustManager = Java.registerClass({
        name: 'org.owasp.trustmanager.TrustManager',
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted: function (chain, authType) {},
            checkServerTrusted: function (chain, authType) {},
            getAcceptedIssuers: function () { return []; }
        }
    });

    var TrustManagers = [TrustManager.$new()];
    var SSLContext_init = SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
    SSLContext_init.implementation = function (keyManager, trustManager, secureRandom) {
        console.log('Bypassing SSL Pinning');
        SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
    };

    // Root Detection Bypass Logic
    var RootPackages = ["com.noshufou.android.su", "com.thirdparty.superuser", "eu.chainfire.supersu"];
    var RootBinaries = ["/system/bin/su", "/system/xbin/su", "/system/sd/xbin/su"];

    var PackageManager = Java.use('android.app.ApplicationPackageManager');
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkgName, flags) {
        if (RootPackages.indexOf(pkgName) >= 0) {
            console.log("Root detection bypass for package: " + pkgName);
            pkgName = "com.android.settings";
        }
        return this.getPackageInfo(pkgName, flags);
    };

    var Runtime = Java.use('java.lang.Runtime');
    Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmd) {
        if (cmd.toString().indexOf("su") >= 0) {
            console.log("Root detection bypass for exec: " + cmd);
            return Runtime.getRuntime().exec("ls");
        }
        return this.exec(cmd);
    };
});
