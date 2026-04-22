// ListColumn.js mein ye changes karein
import React, { useState } from 'react'; // useState add kiya
import TaskCard from "./TaskCard";

const ListColumn = ({ list, onCardAdded }) => { // onCardAdded prop add kiya taake list refresh ho
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");

    const handleAddCard = async () => {
        if (!title.trim()) return;

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    list_id: list.list_id,
                    priority: 'Medium', // Default priority
                    order_index: list.cards?.length || 0
                })
            });

            if (res.ok) {
                setTitle("");
                setIsAdding(false);
                onCardAdded(); // Parent (Page) ko batayen ke data refresh kare
            }
        } catch (err) {
            console.error("Card add karne mein masla:", err);
        }
    };

    return (
        <div className="min-w-75 bg-[#f3cccc] border border-neutral-200/50 p-4 rounded-2xl flex flex-col h-fit max-h-full">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 px-2">
                {list.name}
            </h3> 
            
            <div className="space-y-3 mb-4">
                {list.cards?.map((card) => (
                    <TaskCard key={card.card_id} card={card} />
                ))}
            </div>

            {/* Input Logic */}
            {isAdding ? (
                <div className="bg-white p-3 rounded-xl border border-[#49bac9]/30 shadow-sm">
                    <textarea
                        autoFocus
                        className="w-full text-sm outline-none resize-none text-neutral-700"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                    />
                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={handleAddCard}
                            className="bg-[#49bac9] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#3baec2]"
                        >
                            Add Card
                        </button>
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="text-neutral-400 text-[10px] font-bold px-3 py-1.5 hover:text-neutral-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full text-left p-2 text-[10px] font-bold text-neutral-400 hover:text-[#49bac9] hover:bg-white rounded-lg transition-all"
                >
                    + Add a card
                </button>
            )}
        </div>
    );
};
export default ListColumn;