import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-center text-sm sm:text-left">
            &copy; {new Date().getFullYear()} QuizMaster. All Rights reserved.
          </p>

          {/* Links */}
          <div className="flex mt-4 sm:mt-0 space-x-4">
            <a
              href="privacy-policy"
              className="text-gray-400 text-sm hover:text-white transition"
            >
              Privacy Policy
            </a>
            <a
              href="imprint"
              className="text-gray-400 text-sm hover:text-white transition"
            >
              Imprint
            </a>
            <a
              href="contact"
              className="text-gray-400 text-sm hover:text-white transition"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
