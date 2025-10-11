export default function PriorityIcon({ priority }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0 }}>
        {[...Array(priority)].map((_, i) => (
            <svg width={15} height={15 * 0.6} viewBox="0 0 24 14" key={i}>
                <path d="M2 12 L12 2 L22 12" stroke={priority === 1 ? 'yellow' : priority === 2 ? 'orange' : 'red'} strokeWidth={4} fill="none" />
            </svg>
        ))}
        </div>
    );
}
