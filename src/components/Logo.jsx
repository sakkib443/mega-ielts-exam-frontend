export default function Logo({ className = "" }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src="/images/Logo-01.png"
                alt="BdCalling Academy"
                className="h-8 object-contain"
            />
            <img
                src="/images/Logo-03.png"
                alt="IELTS"
                className="h-8 object-contain"
            />
        </div>
    );
}
