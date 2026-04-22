import React, { useState } from 'react';
import ListColumn from "./ListColumn";

// BoardContainer.js mein ye tabdeeli karein
const BoardContainer = ({ lists, boardId, onListAdded }) => {
    const [isAddingList, setIsAddingList] = useState(false);
    const [listName, setListName] = useState("");

    const handleAddList = async () => {
        if (!listName.trim()) return;

        const res = await fetch('/api/boards/' + boardId + '/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: listName, board_id: boardId })
        });
        

        if (res.ok) {
            setListName("");
            setIsAddingList(false);
            onListAdded(); // Board refresh karne ke liye
        }
    };

    return (
        <div className="flex gap-6 p-10 h-full items-start overflow-x-auto">
            {lists?.map((list) => (
                <ListColumn key={list.list_id} list={list} onCardAdded={onListAdded} />
            ))}

            {isAddingList ? (
                <div className="min-w-75 bg-[#FDFDFD] p-4 rounded-2xl border border-neutral-200">
                    <input
                        autoFocus
                        className="w-full bg-white border border-neutral-200 p-2 rounded-xl text-sm outline-none focus:border-[#49bac9]"
                        placeholder="List Title..."
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                    />
                    <div className="flex gap-2 mt-3">
                        <button onClick={handleAddList} className="bg-[#49bac9] text-white text-[10px] font-bold px-4 py-2 rounded-lg">Add List</button>
                        <button onClick={() => setIsAddingList(false)} className="text-neutral-400 text-[10px] font-bold">Cancel</button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAddingList(true)}
                    className="min-w-75 border-2 border-dashed border-neutral-200 rounded-3xl p-6 text-neutral-400 font-bold text-sm hover:border-neutral-300 hover:bg-white/50 transition-all"
                >
                    + Create New List
                </button>
            )}
        </div>
    );
};
export default BoardContainer;