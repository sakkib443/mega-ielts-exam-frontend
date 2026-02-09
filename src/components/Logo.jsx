export default function Logo({ className = "" }) {
    return (
        <div className={`flex items-center ${className}`}>
            <img
                src="/images/IMG_5177.PNG"
                alt="IELTS EXAM"
                className="h-10 object-contain"
            />
        </div>
    );
}
