import React from 'react';

const TaskCard = ({ card }) => {
    return (
        <div className="p-4 bg-[#FDFDFD] rounded-xl shadow-sm border border-neutral-200 hover:border-[#49bac9]/50 transition-colors cursor-pointer group">
            <h4 className="font-bold text-sm text-neutral-800 group-hover:text-[#49bac9] transition-colors">
                {card.title}
            </h4>
            {card.description && (
                <p className="text-xs text-neutral-500 mt-2 line-clamp-2 italic">
                    {card.description}
                </p>
            )}
        </div>
    );
};

export default TaskCard;