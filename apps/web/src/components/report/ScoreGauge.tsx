/**
 * Score gauge drawn from the Figma geometry ("Group 40"). The scale is static;
 * the needle rotates around the gauge centre according to the score.
 */
const CENTER = { x: 117.6, y: 110 };
/** Direction of the needle as drawn in Figma, in degrees (clockwise from +x). */
const NEEDLE_DRAWN_AT = 35.8;
/** The scale runs clockwise from the bottom-left end (138.8deg) to the bottom-right end. */
const SCALE_START = 138.8;
const SCALE_SWEEP = 262.4;

export function ScoreGauge({ score, maxScore }: { score: number; maxScore: number }) {
  const ratio = Math.max(0, Math.min(score / maxScore, 1));
  const rotation = SCALE_START + ratio * SCALE_SWEEP - NEEDLE_DRAWN_AT;

  return (
    <div
      role="img"
      aria-label={`Score ${score} out of ${maxScore}`}
      className="relative flex h-[178px] w-full items-start justify-center pt-[21px] md:h-[220px] md:w-[436px] md:pt-[22px]"
    >
      <svg viewBox="0 0 240.681 193.595" className="h-[139px] w-auto overflow-visible md:h-[175px]" aria-hidden>
        <path d="M41.8294 182.677C25.1517 164.445 15.0106 140.368 15.0106 113.973C15.0106 57.0573 62.1659 10.9177 120.335 10.9177C178.504 10.9177 225.659 57.0573 225.659 113.973C225.659 140.368 215.518 164.445 198.84 182.677" stroke="#C4D2E9" strokeWidth="21.8353" strokeLinecap="round" fill="none" />
        <path d="M41.8294 182.677C25.1517 164.444 15.0106 140.368 15.0106 113.973C15.0106 108.21 15.494 102.558 16.4233 97.0533" stroke="#8CC9AD" strokeWidth="21.8353" strokeLinecap="round" fill="none" />
        <path d="M199.056 182.677C215.733 164.444 225.874 140.368 225.874 113.973C225.874 108.21 225.391 102.558 224.462 97.0533" stroke="#E66642" strokeWidth="21.8353" strokeLinecap="round" fill="none" />
        <path d="M75.4071 20.7395C89.0356 14.4403 104.267 10.9177 120.34 10.9177C136.413 10.9177 151.645 14.4403 165.273 20.7395" stroke="#DDCF64" strokeWidth="21.8353" strokeLinecap="round" fill="none" />
        <path d="M7.65021 85.4952L4.9166 96.0651L26.0564 101.532L28.79 90.9624L18.2201 88.2288L7.65021 85.4952ZM63.9791 26.5096L69.7377 35.785L69.7377 35.785L63.9791 26.5096ZM18.2201 88.2288L28.79 90.9624C34.7459 67.9329 49.6272 48.2707 69.7377 35.785L63.9791 26.5096L58.2204 17.2342C33.5232 32.5675 15.0653 56.8236 7.65021 85.4952L18.2201 88.2288ZM63.9791 26.5096L69.7377 35.785C72.8818 33.8331 76.1519 32.0577 79.5336 30.4734L74.9018 20.587L70.27 10.7005C66.1108 12.6491 62.0882 14.8329 58.2204 17.2342L63.9791 26.5096Z" fill="#A9C98C" />
        <path d="M232.539 85.4952L235.273 96.0651L214.133 101.532L211.399 90.9624L221.969 88.2288L232.539 85.4952ZM176.21 26.5096L170.452 35.785L170.452 35.785L176.21 26.5096ZM221.969 88.2288L211.399 90.9624C205.443 67.9329 190.562 48.2707 170.452 35.785L176.21 26.5096L181.969 17.2342C206.666 32.5675 225.124 56.8236 232.539 85.4952L221.969 88.2288ZM176.21 26.5096L170.452 35.785C167.308 33.8331 164.037 32.0577 160.656 30.4734L165.287 20.587L169.919 10.7005C174.079 12.6491 178.101 14.8329 181.969 17.2342L176.21 26.5096Z" fill="#E6AA42" />
        <g stroke="#F1F4F7" strokeWidth="8.18825">
          <path d="M0.428592 96.7972L31.2157 100.038" />
          <path d="M240.252 98.4176L209.465 101.658" />
          <path d="M80.509 36.5778L66.8555 8.79413" />
          <path d="M160.858 36.5778L174.512 8.79413" />
        </g>
        <path
          transform={`rotate(${rotation.toFixed(1)} ${CENTER.x} ${CENTER.y})`}
          d="M107.679 101.808C106.609 103.575 105.877 105.568 105.525 107.67C105.174 109.773 105.209 111.945 105.63 114.062C106.05 116.179 106.848 118.2 107.977 120.008C109.105 121.817 110.543 123.378 112.208 124.602L183.703 157.785L128.491 97.6724C126.828 96.446 124.969 95.5801 123.023 95.1242C121.076 94.6683 119.079 94.6313 117.146 95.0154C115.213 95.3995 113.382 96.197 111.758 97.3625C110.133 98.5279 108.747 100.038 107.679 101.808Z"
          fill="#18334D"
        />
      </svg>
      <p className="absolute left-1/2 top-[calc(50%+36px)] -translate-x-1/2 whitespace-nowrap font-display text-[19.4px] font-medium leading-[47px] text-[#304f6d] md:top-[calc(50%+52px)] md:text-2xl md:leading-[58px]">
        {score} / {maxScore}
      </p>
    </div>
  );
}
