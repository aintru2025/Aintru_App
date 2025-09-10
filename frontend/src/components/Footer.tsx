import React from 'react';
import { Zap, Github, Mail, Phone, Heart } from 'lucide-react';
import logo from '../assets/aintru-logo.png';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <img src={logo} alt="Aintru Logo" className="w-10 h-auto" />
            <span className="text-2xl font-bold bg-gradient-to-r from-enteru-600 to-enteru-800 bg-clip-text text-transparent">Aintru</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Empowering the next generation of professionals with AI-powered career tools and interview preparation.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-lg">Product</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Mock Interviews</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Job Matching</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Coach</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-lg">Company</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-lg">Support</h4>
          <ul className="space-y-3 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; 2024 Aintru. All rights reserved. Made with <Heart className="inline w-4 h-4 text-red-500" /> for students and professionals worldwide.</p>
      </div>
    </div>
  </footer>
);

export default Footer; 