import { BrowserProvider, Eip1193Provider } from "ethers/types/providers";

declare global {
  interface Window {
    ethereum: Eip1193Provider & BrowserProvider;
  }
}

// Using the global.d.ts file, we can define a new interface called Window that extends the Eip1193Provider and BrowserProvider
// interfaces from ethers. This will allow us to access the ethereum object on the window object without TypeScript throwing an 
// error. This is a common pattern when working with global objects in TypeScript.