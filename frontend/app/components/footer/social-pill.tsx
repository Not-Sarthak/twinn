export function SocialPill() {
  return (
    <div className="z-30 flex place-items-center space-x-1 rounded-full bg-dark-primary px-3 py-1.5">
      <a href="https://x.com/use_twinn">
        <svg
          className="h-6 w-6 text-gray-400 hover:text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.31 18.25C14.7819 18.25 17.7744 13.4403 17.7744 9.26994C17.7744 9.03682 17.9396 8.83015 18.152 8.73398C18.8803 8.40413 19.8249 7.49943 18.8494 5.97828C18.2031 6.32576 17.6719 6.51562 16.9603 6.74448C15.834 5.47393 13.9495 5.41269 12.7514 6.60761C11.9785 7.37819 11.651 8.52686 11.8907 9.62304C9.49851 9.49618 6.69788 7.73566 5.1875 5.76391C4.39814 7.20632 4.80107 9.05121 6.10822 9.97802C5.63461 9.96302 5.1716 9.82741 4.75807 9.58305V9.62304C4.75807 11.1255 5.75654 12.4191 7.1444 12.7166C6.70672 12.8435 6.24724 12.8622 5.80131 12.771C6.19128 14.0565 7.87974 15.4989 9.15272 15.5245C8.09887 16.4026 6.79761 16.8795 5.45806 16.8782C5.22126 16.8776 4.98504 16.8626 4.75 16.8326C6.11076 17.7588 7.69359 18.25 9.31 18.2475V18.25Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <span className="sr-only">Twitter</span>
      </a>
      <a href="#">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5 text-gray-400 hover:text-gray-300"
          fill="none"
        >
          <path
            d="M8.52 13.85C7.48 13.85 6.63 12.9 6.63 11.74C6.63 10.59 7.46 9.64 8.52 9.64C9.57 9.64 10.43 10.59 10.41 11.74C10.41 12.9 9.57 13.85 8.52 13.85Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.49 13.85C14.45 13.85 13.6 12.9 13.6 11.74C13.6 10.59 14.43 9.64 15.49 9.64C16.54 9.64 17.4 10.59 17.38 11.74C17.38 12.9 16.56 13.85 15.49 13.85Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.13 4.32L9.82 3.76L9.18 3.87C7.72 4.11 6.33 4.55 5.03 5.15L4.8 5.25L4.66 5.46C2.04 9.31 1.33 13.11 1.68 16.84L1.72 17.24L2.05 17.48C3.79 18.75 5.47 19.52 7.13 20.03L7.92 20.27L9.03 17.55C10.94 18.02 13.06 18.02 14.97 17.55L16.08 20.27L16.87 20.03C18.52 19.52 20.21 18.75 21.95 17.48L22.27 17.24L22.31 16.84C22.75 12.52 21.62 8.76 19.35 5.46L19.21 5.25L18.98 5.15C17.68 4.55 16.29 4.11 14.83 3.87L14.21 3.76L13.9 4.3C13.81 4.45 13.72 4.62 13.64 4.8C12.54 4.68 11.46 4.68 10.37 4.8C10.29 4.63 10.2 4.46 10.13 4.32Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Discord</span>
      </a>
      <a href="https://github.com/Not-Sarthak/twinn">
        <svg
          className="h-6 w-6 text-gray-400 hover:text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.75 12C4.75 10.7811 5.05079 9.63249 5.58219 8.62429L4.80156 6.0539C4.53964 5.19151 5.46262 4.44997 6.24833 4.89154L8.06273 5.91125C9.1965 5.17659 10.5484 4.75 12 4.75C13.4526 4.75 14.8054 5.17719 15.9396 5.91278L17.7624 4.8911C18.549 4.45014 19.4715 5.19384 19.2075 6.05617L18.42 8.62837C18.95 9.63558 19.25 10.7828 19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <span className="sr-only">GitHub</span>
      </a>
    </div>
  );
}
