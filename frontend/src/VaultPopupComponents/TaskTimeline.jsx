import React, { useMemo } from "react";

// Time calculations use UTC calendar days to avoid timezone shifting issues.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// number of calendar days from b -> a (a - b)
function daysDiffUtc(a, b) {
    const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
    const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
    return Math.round((utcA - utcB) / MS_PER_DAY);
}

function utcStartOfDay(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export default function TaskTimeline(props) {
    const { 
        tasks = [],
        queryIndex,
        dayWidth = 36,
        rowHeight = 40,
        hideCompletedTasks = false,
        clickAction
    } = props;

    const today = new Date().getDate();

    // compute month start and end (UTC)
    const { monthStartUtc, monthEndUtc, daysInMonth } = useMemo(() => {
        const year = queryIndex.getFullYear();
        const month = queryIndex.getMonth(); // 0-based
        
        const ms = new Date(Date.UTC(year, month, 1));
        const me = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        const days = me.getUTCDate();
        return { monthStartUtc: ms, monthEndUtc: me, daysInMonth: days };
    }, [queryIndex]);

    const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${daysInMonth}, ${dayWidth}px)` };

    const statusColor = (status) => {
        if (!status) return '#9CA3AF';
        if (status === 'pending') return 'orange'; // amber
        if (status === 'in progress') return '#2daaff'; // blue
        if (status === 'completed') return '#22c55e'; // green
        return '#6B7280';
    };

    const getLeftAndWidthForTask = (task) => {
        const taskStart = utcStartOfDay(task.startDate);
        const taskEnd = utcStartOfDay(task.endDate);

        // clamp
        const clampedStart = taskStart < monthStartUtc ? monthStartUtc : taskStart;
        const clampedEnd = taskEnd > monthEndUtc ? monthEndUtc : taskEnd;

        const leftDays = daysDiffUtc(clampedStart, monthStartUtc); // 0-based
        const widthDays = daysDiffUtc(clampedEnd, clampedStart) + 1; // inclusive days

        return {
            left: leftDays * dayWidth,
            width: Math.max(widthDays * dayWidth, dayWidth),
        };
    };

    return (
        <div style={{ overflowX: 'scroll', backgroundColor: '#1b2232', scrollbarWidth: 'none', padding: '10px 10px 20px 10px', borderRadius: '10px' }}>
            {/* Header (day numbers) */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: '1 0 auto', overflow: 'scroll', scrollbarWidth: 'none', paddingRight: '10px' }}>
                    <div style={{ ...gridStyle, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {Array.from({ length: daysInMonth }).map((_, i) => (
                            <div key={i} style={{ backgroundColor: today === i+1 ? '#121826' : 'transparent', width: dayWidth, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#9CA3AF', borderRadius: '6px' }}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body: rows for each visible task */}
            <div style={{ marginTop: 8 }}>
                {tasks.length === 0 && (
                    <div style={{ padding: 20, color: '#9CA3AF' }}>No tasks for this month.</div>
                )}
                {tasks.map((task, idx) => {
                    if (hideCompletedTasks && task.status === "completed") return null;
                    const { left, width } = getLeftAndWidthForTask(task);
                    return (
                        <div key={idx} style={{display: 'flex', alignItems: 'center', height: rowHeight, minWidth: daysInMonth * dayWidth, backgroundImage: 'none', backgroundSize: `${dayWidth}px 100%`, backgroundRepeat: 'repeat-x', backgroundPosition: '0 0', backgroundImage: 'linear-gradient(to right, #222b3e 1px, transparent 1px)'}}>
                            <div style={{ position: 'relative', flex: '1 0 auto', minWidth: daysInMonth * dayWidth }}>
                                <div role="button" title={`${task.task} — ${task.startDate.split("T")[0]} → ${task.endDate.split("T")[0]}`}
                                    style={{
                                        position: 'absolute', left,
                                        top: Math.max(4, (rowHeight - Math.min(rowHeight * 0.6, 28)) / 2),
                                        width, height: Math.min(rowHeight * 0.6, 28),
                                        background: statusColor(task.status),
                                        borderRadius: 6, zIndex: 2,
                                        display: 'flex', alignItems: 'center', padding: '0 8px',
                                        color: '#032', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                                        cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis', fontSize: 12, fontWeight: 600
                                    }}
                                    onClick={() => clickAction(task)}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {task.task}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
