const PartisanPulseLogo = (props) => (
	<svg
	  xmlns="http://www.w3.org/2000/svg"
	  viewBox="0 0 100 100"
	  {...props}
	>
	  {/* Background Circle */}
	  <circle cx="50" cy="50" r="48" fill="#1E1E1E" stroke="#FFF" strokeWidth="2" />
  
	  {/* Left (Democratic) Section */}
	  <path d="M10,50 A40,40 0 0,1 50,10 V50 Z" fill="#1877F2" />
	  
	  {/* Right (Republican) Section */}
	  <path d="M50,10 A40,40 0 0,1 90,50 H50 Z" fill="#D93025" />
	  
	  {/* Center Pulse (Independent) */}
	  <polyline points="20,60 40,40 50,55 60,35 80,60" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
  );
  
  export default PartisanPulseLogo;
  