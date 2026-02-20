'use client';
// // import Script from 'next/script';

export default function ThirdPartyScripts() {
  return (
    <>
      {/* 
        Facebook Pixel - Strategy: afterInteractive 
        Loads immediately after hydration to track PageView events ensuring conversion data accuracy.
      */}
      {/* 
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID_HERE');
            fbq('track', 'PageView');
          `,
        }}
      />
      */}

      {/* 
        Chat Widget - Strategy: lazyOnload 
        Loads during browser idle time to NOT affect Initial Load or TTI.
        Perfect for heavy support widgets.
      */}
      {/*
      <Script
        id="chat-widget"
        src="https://example-chat-provider.com/loader.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Chat widget loaded lazily during idle time')}
      />
      */}
    </>
  );
}
