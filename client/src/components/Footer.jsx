import React from "react";
import { assets } from "../assets/assets";
import { Github, Linkedin } from "lucide-react";


const Footer = () => {
  return (
    <footer className="px-6 mt-40 md:px-16 lg:px-36 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <img className="w-36 h-auto" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.appStore}
              alt="google play"
              className="h-10 w-auto border border-white rounded"
            />
            <img
              src={assets.googlePlay}
              alt="app store"
              className="h-10 w-auto border border-white rounded"
            />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About us</a>
              </li>
              <li>
                <a href="#">Contact us</a>
              </li>
              <li>
                <a href="#">Privacy policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
               <p className="hover:text-green-300 transition duration-200">📞 +91-7718199727</p>
            <p className="hover:text-green-300 transition duration-200">📧 saikatadhyawork@gmail.com</p>
              <p className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <a
                  href="https://www.linkedin.com/in/saikat-adhya-53b7452a9/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-400"
                >
                  LinkedIn
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-300" />
                <a
                  href="https://github.com/Saikat-Adhya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-gray-300"
                >
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} © SAIKAT ADHYA. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
