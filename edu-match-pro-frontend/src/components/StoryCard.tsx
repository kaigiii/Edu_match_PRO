import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UsersIcon, 
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import type { ImpactStory } from '../types';

interface StoryCardProps {
  story: ImpactStory;
  onView?: (story: ImpactStory) => void;
}

const StoryCard = ({ story, onView }: StoryCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onView?.(story)}
      role={onView ? 'button' : undefined}
      tabIndex={onView ? 0 : undefined}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-blue-600 text-sm font-medium">載入中...</div>
            </div>
          </div>
        )}
        
        <img 
          src={story.imageUrl} 
          alt={story.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-5xl mb-3">📸</div>
              <div className="text-sm font-medium">圖片載入失敗</div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <motion.div
          className="absolute top-4 right-4 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView?.(story); }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200"
          >
            <EyeIcon className="h-5 w-5 text-gray-700" />
          </button>
        </motion.div>

        {/* Impact Badge */}
        {story.impact && (
          <div className="absolute bottom-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <UsersIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-800">
                {story.impact.studentsBenefited} 位學生受益
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {story.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {story.summary}
        </p>

        {/* Impact Stats */}
        {story.impact && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {story.impact.studentsBenefited} 位學生
                </span>
              </div>
              {story.impact.duration && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-800 font-medium">
                    {story.impact.duration}
                  </span>
                </div>
              )}
            </div>
            {story.impact.equipmentDonated && (
              <div className="mt-2 text-xs text-gray-600">
                捐贈設備: {story.impact.equipmentDonated}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span className="font-medium">{story.companyName}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AcademicCapIcon className="h-4 w-4" />
              <span className="font-medium">{story.schoolName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>{story.storyDate}</span>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </div>

      {/* Love Button */}
      <motion.button
        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors duration-200 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors duration-200" />
      </motion.button>
    </motion.div>
  );
};

export default StoryCard;
