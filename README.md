# GTA V Config Optimiser - Your Easy Game Tuner!

## 🎮 Get Your GTA V Settings Just Right!

Hey there, fellow gamer! Ever wanted to tweak your GTA V settings without getting lost in those tricky `settings.xml` files? Well, good news! This **GTA V Config Optimiser** is a super simple, web-based tool made just for that. It's built with Next.js, and it's all about making it easy for you to dial in your game's graphics, system, audio, and video settings. No more messy manual edits!

Just upload your `settings.xml` file, play around with the settings using our friendly interface, and boom! Download your spruced-up config, ready to drop straight into your game. Easy peasy!

## ✨ Cool Stuff It Can Do

* **Super Friendly Look:** The interface is clean and easy on the eyes, thanks to Shadcn UI.

* **Simple Editing:** Adjust tons of game settings like how pretty the graphics look, how far things load, shadow details, and loads more. We've got sliders, switches, and dropdowns to make it a breeze.

* **Organized Settings:** All your settings are neatly tucked away into groups like Graphics, System, Audio, and Video. Finding what you need is a snap!

* **Info You Can't Break:** Important stuff like your video card and DirectX version is right there for you to see, but don't worry, you can't accidentally change it!

* **Smart Type Handling:** The tool figures out if a setting is a simple on/off, a number, or just text, and gives you the right control for it. How cool is that?

* **XML Magic:** It can read your `settings.xml` file, let you change things, and then turn it back into a perfect XML file. Pretty neat, huh?

* **File Checks:** No worries about uploading the wrong thing! It'll make sure your file is XML, not too big, and looks correct.

* **GitHub Pages Ready:** This whole thing is built to be a static website, so it's perfect for hosting on places like GitHub Pages.

## 🚀 Let's Get Started!

Want to try it out on your own computer? Here’s how you can get it running.

### What You'll Need

* **Node.js** (Grab the latest long-term support version, like v20.x)

* **pnpm** (Our favorite way to manage project stuff)

### How to Set It Up

1.  **Grab the code:**

    ```
    git clone [https://github.com/bynarig/gta-optimiser.git](https://github.com/bynarig/gta-optimiser.git)
    cd gta-optimiser


    ```

2.  **Install all the bits and bobs:**

    ```
    pnpm install


    ```

3.  **Fire up the dev server:**

    ```
    pnpm dev


    ```

    Then, just open up your browser and head to <http://localhost:3000> to see it in action!

## 🛠️ How to Use It

1.  **Find your `settings.xml`:**

    * It's usually in your GTA V game folder. On Windows, it's often something like:
        `C:\Users\<YourUsername>\Documents\Rockstar Games\GTA V\settings.xml`

2.  **Upload the file:** On the website, just click the upload button and pick your `settings.xml` file.

3.  **Tweak away!** Use those friendly sliders, switches, and dropdowns to get your game just how you like it.

4.  **Download your new config:** Hit the "Download Optimized Config" button. Your fresh `settings.xml` file will zip right into your downloads.

5.  **Swap 'em out:** Copy that new `settings.xml` file into your GTA V game folder, replacing the old one. (Maybe save the original just in case, first!)

6.  **Play!** Start up GTA V and see how much better it runs or looks!

## 🏗️ What's Inside the Box?

* `src/app/`: Where all the main web pages live.

* `src/components/ui/`: All the cool buttons and forms from Shadcn UI.

* `src/components/GtaConfigEditor.tsx`: This is the brains of the operation, handling all the settings.

* `src/app/page.tsx`: The main page that lets you upload and edit.

* `src/lib/xml-helpers.ts`: The behind-the-scenes magic for reading and writing XML.

* `public/`: Any extra images or files the website uses.

## 🤝 Want to Help Out?

Got ideas? Found a bug? We'd love to hear from you! Feel free to open an issue or send in a pull request.

## 📄 License

This project's under the MIT License – check out the [LICENSE](LICENSE) file for all the details.

## 🙏 Big Thanks To:

* [Next.js](https://nextjs.org/)

* [React](https://react.dev/)

* [pnpm](https://pnpm.io/)

* [Shadcn UI](https://ui.shadcn.com/)

* [Lucide React](https://lucide.dev/icons/)

* [Peaceiris GitHub Pages Action](https://github.com/peaceiris/actions-gh-pages)