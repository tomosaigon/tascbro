# tascbro: Timing Attack Side Channel in the Browser

What if a local website could determine that a visitor had admin access to a local church website and also an active account on Grindr?

Or what if an advertiser, just by placing some JavaScript on a news website, could detect 
if the visitor was inside a bank or government office and could then scan the office network and gather intel about network topology or just use the information to fingerprint the visitor for the future?

Websites can even gather intelligence about a visitor's political ideologies based on what other websites and pages that visitor has visited in the past. This is done by tricking the browser into revealing information to the advertiser that is supposed to stay hidden. The browser will generally not allow this information to be revealed to other websites, but it is still possible through a timing attack, a form of side channel attack. Other such timing, side channel attacks in the past have led to things hardware-breaking vulnerabilities like Spectre and Meltdown.

I built a tool to test out browser-based timing attacks that were found by @tomvangoethem quite a while ago. Browser vendors have since made changes that affect these information leaks but they are still fun to try out on different URLs to see how they work and what information you might gather from the timing
 differences. You can choose from several timing measurement methods and request a URL multiple times to calculate an average time and then repeat on a different URL from your browser, which may be logged into a site (this can affect timing) or have it cached to see if timing is different.
 
Source: https://github.com/tomosaigon/tascbro

The tool is made to support additional measurement methods as functions inside measure.js in the future. Some methods may only be effective by using outdated browser versions.

Additionally, I've mocked up a quick demo which uses timing in the browser to scan your local network, which any website could force you to do. This uses one of the above measurement methods to gather how long different IP address is take to respond without caring what the responses and using K means clustering to group IP addresses into common (and probably nonexistent) and ones which respond quickly and are probably real hosts on your network. 
You can try it out on your own net work, and let me know how effective it is at guessing.

Demo: https://tomosaigon.github.io/tascbro/scan.html

There is one more tool which uses web RTC with audio streaming permission (microphone) to determine what your home IP address is.

What can you do about it? Browsing in incognito mode can prevent a site from checking if you're logged into other sites, although incognito mode is not foolproof either. And this doesn't protect your home network from being scanned.

In conclusion, every website you visit could be an adversary and be trying to spy on what other websites you visit. The browser mostly blocks this but timing attacks are one way such information can still leak across tabs.

Timing attacks are interesting because of how subtle they are yet they are found everywhere. They have been used to crack passwords on hardware devices and it's especially concerning when these side channels exist in something as commonly used as your browser.
