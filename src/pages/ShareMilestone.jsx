import React from 'react';
import { motion } from 'framer-motion';
import { Share2, MessageCircle, Twitter } from 'lucide-react';

const ShareMilestone = ({ streak = 0, username = 'Anuja' }) => {
  const shareWhatsApp = () => {
    const text = `🎉 ${streak}-day streak on HealthyHabits! Crushing wellness goals! 💪 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTwitter = () => {
    const text = `Just hit ${streak}-day streak on HealthyHabits Tracker! 🏆 #Wellness #Habits`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${window.location.origin}`, '_blank');
  };

  return (
    <motion.div 
      className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-200/50"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-6 h-6 text-emerald-500" />
        <h4 className="font-bold text-xl">Share Milestone!</h4>
      </div>
      <p className="text-muted-foreground mb-6">
        "{username} hit {streak}-day streak! 🏆"
      </p>
      <div className="flex gap-3">
        <button
          onClick={shareWhatsApp}
          className="flex-1 p-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
        <button
          onClick={shareTwitter}
          className="p-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          <Twitter className="w-5 h-5" />
          Twitter
        </button>
      </div>
    </motion.div>
  );
};

export default ShareMilestone;
