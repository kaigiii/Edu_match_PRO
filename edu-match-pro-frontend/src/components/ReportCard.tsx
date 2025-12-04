import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrophyIcon,
    UserGroupIcon,
    HeartIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

interface StrategyData {
    type: string;
    title: string;
    content: string;
    school?: string;
    area?: string;
    allocation?: string;
}

interface ReportCardProps {
    data: {
        strategies: StrategyData[];
    };
}

const ReportCard: React.FC<ReportCardProps> = ({ data }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<string>('A');

    const strategies = data.strategies;
    const currentStrategy = strategies.find(s => s.type === selectedStrategy) || strategies[0];

    const getIcon = (type: string) => {
        switch (type) {
            case 'A': return <TrophyIcon className="w-6 h-6" />;
            case 'B': return <UserGroupIcon className="w-6 h-6" />;
            case 'C': return <HeartIcon className="w-6 h-6" />;
            default: return <TrophyIcon className="w-6 h-6" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'A': return 'from-amber-500 to-orange-600';
            case 'B': return 'from-blue-500 to-cyan-600';
            case 'C': return 'from-rose-500 to-pink-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrophyIcon className="w-64 h-64 transform rotate-12" />
                </div>
                <h2 className="text-3xl font-bold mb-2 relative z-10">專業捐贈策略分析報告</h2>
                <p className="text-slate-300 relative z-10">根據數據分析，我們為您規劃了以下三個最佳方案</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                {strategies.map((strategy) => (
                    <button
                        key={strategy.type}
                        onClick={() => setSelectedStrategy(strategy.type)}
                        className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 transition-all duration-300 ${selectedStrategy === strategy.type
                                ? 'bg-gray-50 text-gray-900 border-b-2 border-purple-600 font-bold'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getColor(strategy.type)} text-white shadow-sm`}>
                            {getIcon(strategy.type)}
                        </div>
                        <span className="hidden sm:inline">{strategy.title}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-8 bg-gray-50 min-h-[400px]">
                <motion.div
                    key={selectedStrategy}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center space-x-4 mb-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getColor(currentStrategy.type)} text-white shadow-lg`}>
                            {getIcon(currentStrategy.type)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{currentStrategy.title}</h3>
                            <p className="text-gray-500 text-sm">
                                {currentStrategy.type === 'A' && '集中資源，創造最大亮點'}
                                {currentStrategy.type === 'B' && '區域共享，擴大受惠範圍'}
                                {currentStrategy.type === 'C' && '填補缺口，照顧被遺忘的角落'}
                            </p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">目標對象</p>
                            <p className="text-lg font-bold text-slate-800">
                                {currentStrategy.school || currentStrategy.area || '多所學校'}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">建議分配</p>
                            <p className="text-lg font-bold text-slate-800">
                                {currentStrategy.allocation || '詳見說明'}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Content */}
                    <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>
                            {currentStrategy.content}
                        </ReactMarkdown>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 flex justify-end">
                        <button className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all
              bg-gradient-to-r ${getColor(currentStrategy.type)}
            `}>
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>選擇此方案</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReportCard;
