import wordmark from "@/assets/eatos-wordmark-black.png.asset.json";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark (eatOS or lcrOS, set by the build variant). Black on light surfaces, automatically white in the dark
 * appearance. `invert` pins it to white for surfaces that are dark in both
 * appearances (e.g. the `bg-shell` help-centre header).
 * Never use the pink app icon inside page content - pink is for launcher icons only.
 */
export function Wordmark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={wordmark.url}
      alt={brand.tagline}
      className={cn(
        "h-14 w-auto object-contain",
        invert ? "invert" : "dark:invert",
        className,
      )}
    />
  );
}

/**
 * The eatOS "e" mark, drawn from the app-icon artwork as inline vector so it
 * takes the surrounding text colour instead of a fixed fill. Pass
 * `text-shell-foreground` on the dark navigation rail. Same shape as the
 * launcher icon, but never pink in page content.
 */
export function EMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={brand.tagline}
      className={cn("shrink-0", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.3169 18.613C33.1414 17.6617 32.3854 16.9664 31.4809 16.8037C30.6169 14.0701 29.2467 11.9773 27.3641 10.5319C25.5004 9.10063 23.2061 8.43294 20.4784 8.54028C20.2624 7.35884 19.2296 6.46094 17.9876 6.46094C16.5836 6.46094 15.4496 7.5958 15.4496 8.99261C15.4496 9.16139 15.4705 9.32341 15.4975 9.48544C14.1205 9.97827 12.8914 10.6669 11.812 11.5513C10.1306 12.9218 8.94326 14.6305 8.24733 16.6828C7.74783 18.1681 7.54533 19.7539 7.64658 21.4356C6.91083 21.9278 6.50583 22.8324 6.68133 23.7506C6.86425 24.6552 7.55208 25.3303 8.39583 25.5329C8.35601 25.3911 8.32158 25.2493 8.29526 25.1008C8.33508 25.2493 8.38301 25.3911 8.42958 25.5403C8.84134 26.7683 9.40834 27.8687 10.1171 28.8618C10.1576 28.9226 10.2048 28.9827 10.2521 29.0502C10.2993 29.1116 10.3466 29.1656 10.3871 29.219C10.4546 29.3142 10.5288 29.408 10.6038 29.4958C11.9666 31.1498 13.6879 32.2982 15.7669 32.9591C17.8391 33.6207 20.1341 33.7152 22.6586 33.2501C24.7984 32.8518 26.6682 32.1294 28.2686 31.0755C29.8474 30.0433 31.1164 28.7538 32.0749 27.1869C32.1019 27.1471 32.0891 27.093 32.0479 27.066L27.9102 24.1826C27.8703 24.1556 27.8089 24.1631 27.7819 24.2096C27.1143 25.1548 26.3172 25.9386 25.3789 26.5455C24.4204 27.1673 23.3748 27.5852 22.2476 27.7952C20.7018 28.0848 19.2971 27.9032 18.0416 27.2618C17.5691 27.0249 17.1439 26.7217 16.7524 26.3632C16.6788 26.3032 16.5904 26.2221 16.5026 26.1276C16.4621 26.0804 16.4216 26.0257 16.3744 25.9717C15.9498 25.5329 15.5914 24.9995 15.2944 24.3987C15.2674 24.3514 15.2471 24.3048 15.2201 24.2569C15.2471 24.2981 15.2748 24.3447 15.3079 24.3987L31.5214 21.2729C32.7567 21.0373 33.5539 19.8484 33.3169 18.613M40 20.0036C40 31.0484 31.0501 40.0004 20.0003 40.0004C8.95661 40.0004 0 31.0484 0 20.0036C0 8.95131 8.95661 0 20.0003 0C31.0501 0 40 8.95131 40 20.0036M25.1437 17.8847L14.2755 19.9708C14.2687 18.3769 14.667 17.0334 15.4635 15.9397C16.2877 14.8197 17.4345 14.1243 18.9195 13.8469C20.4923 13.5572 21.8423 13.7996 22.9769 14.5699C24.0563 15.3118 24.7792 16.419 25.1437 17.8847"
        fill="currentColor"
      />
    </svg>
  );
}
