export default function Logo({ className = "", size = "default" }) {
    const heightClass = size === "small" ? "h-10" : size === "large" ? "h-16" : "h-14";

    return (
        <div className={`flex items-center ${className}`}>
            <img
                src="/images/IMG_5177.PNG"
                alt="Mizan's Care | idp IELTS Official Test Venue"
                className={`${heightClass} object-contain`}
            />
        </div>
    );
}
