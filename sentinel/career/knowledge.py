"""Static career knowledge base: skills, courses, clubs, scholarships, and
Rutgers-specific labs mapped to the canonical tech keyword vocabulary."""

from typing import TypedDict


class SkillMap(TypedDict):
    courses: list[str]          # Rutgers MAE/ECE course names
    skills: list[str]           # Technical skills to develop
    tools: list[str]            # Software / tools
    why: str                    # One-line rationale for an AAE freshman


class ScholarshipInfo(TypedDict):
    name: str
    sponsor: str
    amount: str
    deadline_note: str
    url: str
    relevant_keywords: list[str]


class ClubInfo(TypedDict):
    name: str
    description: str
    relevant_keywords: list[str]
    how_to_join: str


class CollegeAction(TypedDict):
    year: str           # "Freshman", "Sophomore", etc.
    action: str
    rationale: str
    relevant_keywords: list[str]


# ---------------------------------------------------------------------------
# Skills map: tech keyword → what to study at Rutgers AAE
# ---------------------------------------------------------------------------

SKILLS_MAP: dict[str, SkillMap] = {
    "hypersonics": {
        "courses": [
            "Aerodynamics I & II (MAE 433/434)",
            "Gas Dynamics (MAE 456)",
            "Heat Transfer (MAE 361)",
            "Computational Fluid Dynamics (MAE 589)",
            "Introduction to Flight (MAE 331)",
        ],
        "skills": ["CFD simulation", "aerothermodynamics", "shock physics", "thermal protection systems"],
        "tools": ["ANSYS Fluent", "OpenFOAM", "MATLAB", "Python (NumPy/SciPy)"],
        "why": "Hypersonics is the fastest-growing defense domain — contractors are spending billions and need engineers who understand high-speed aero and thermal loads.",
    },
    "directed energy": {
        "courses": [
            "Electromagnetics (ECE 341)",
            "Photonics (ECE 481)",
            "Optics (Physics 385)",
            "Power Electronics (ECE 477)",
        ],
        "skills": ["laser physics", "beam control", "high-power electronics", "thermal management"],
        "tools": ["ZEMAX", "COMSOL", "LTspice"],
        "why": "Directed energy is moving from R&D to fielded systems — cross-disciplinary background in ECE + MAE is rare and highly valued.",
    },
    "autonomy": {
        "courses": [
            "Dynamics and Control (MAE 452)",
            "Robotics (ECE 472 / CS 460)",
            "Machine Learning (CS 461)",
            "Feedback Control Systems (MAE 452)",
            "Linear Systems (ECE 416)",
        ],
        "skills": ["path planning", "state estimation", "ROS", "sensor fusion", "SLAM"],
        "tools": ["ROS2", "Python", "MATLAB/Simulink", "Gazebo"],
        "why": "Every major platform — aircraft, missiles, ground vehicles — is getting autonomy layers. This is the highest-hiring area among defense primes right now.",
    },
    "AI/ML": {
        "courses": [
            "Machine Learning (CS 461)",
            "Deep Learning (CS 536)",
            "Probability and Statistics (MAE 351 or ECE 226)",
            "Linear Algebra (Math 250)",
            "Data Structures (CS 112)",
        ],
        "skills": ["neural networks", "computer vision", "reinforcement learning", "data pipelines"],
        "tools": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "Jupyter"],
        "why": "DoD is spending heavily on AI-enabled systems. Engineers who can combine domain expertise with ML skills command premiums at every contractor.",
    },
    "UAS": {
        "courses": [
            "Introduction to Flight (MAE 331)",
            "Aerodynamics I (MAE 433)",
            "Dynamics and Control (MAE 452)",
            "Embedded Systems (ECE 431)",
            "Feedback Control (MAE 452)",
        ],
        "skills": ["flight dynamics modeling", "autopilot design", "embedded C/C++", "FAA Part 107"],
        "tools": ["ArduPilot", "PX4", "MATLAB/Simulink", "SolidWorks"],
        "why": "UAS is the most accessible entry point into defense aerospace — you can build and fly hardware as a freshman, which makes your resume stand out immediately.",
    },
    "VTOL": {
        "courses": [
            "Introduction to Flight (MAE 331)",
            "Aerodynamics I (MAE 433)",
            "Dynamics and Control (MAE 452)",
            "Propulsion (MAE 456)",
        ],
        "skills": ["rotor aerodynamics", "transition flight control", "CFD for rotors"],
        "tools": ["MATLAB/Simulink", "ANSYS", "RotCFD"],
        "why": "eVTOL and military VTOL programs (Army FARA, FLRAA) are seeing massive investment — Boeing and Lockheed are both deep in this space.",
    },
    "propulsion": {
        "courses": [
            "Thermodynamics (MAE 341)",
            "Gas Dynamics (MAE 456)",
            "Propulsion (MAE 456)",
            "Heat Transfer (MAE 361)",
            "Combustion (MAE 572)",
        ],
        "skills": ["cycle analysis", "combustion modeling", "turbomachinery", "rocket propulsion"],
        "tools": ["NASA CEA", "ANSYS Fluent", "MATLAB", "OpenFOAM"],
        "why": "Propulsion underpins every platform — aircraft, missiles, and space vehicles all need propulsion engineers, making this one of the most durable career paths.",
    },
    "cyber": {
        "courses": [
            "Computer Security (CS 419)",
            "Operating Systems (CS 416)",
            "Networks (CS 352)",
            "Embedded Systems (ECE 431)",
        ],
        "skills": ["penetration testing", "embedded security", "network security", "secure coding"],
        "tools": ["Wireshark", "Ghidra", "Linux", "Python"],
        "why": "Cyber vulnerabilities in weapons systems are a top DoD concern — aerospace engineers with security training are in very short supply.",
    },
    "radar": {
        "courses": [
            "Electromagnetics (ECE 341)",
            "Signals and Systems (ECE 346)",
            "Digital Signal Processing (ECE 448)",
            "Antenna Theory (ECE 541)",
        ],
        "skills": ["signal processing", "phased arrays", "SAR", "Doppler processing"],
        "tools": ["MATLAB", "GNU Radio", "Python (NumPy/SciPy)"],
        "why": "Radar is fundamental to ISR, missile defense, and air traffic — Raytheon and L3Harris are the biggest employers and recruit heavily from ECE/MAE.",
    },
    "electronic warfare": {
        "courses": [
            "Electromagnetics (ECE 341)",
            "RF Circuits (ECE 441)",
            "Signals and Systems (ECE 346)",
            "Digital Signal Processing (ECE 448)",
        ],
        "skills": ["RF design", "jamming/spoofing fundamentals", "spectrum analysis", "FPGA"],
        "tools": ["MATLAB", "GNU Radio", "Xilinx Vivado", "Keysight ADS"],
        "why": "EW is classified as a critical capability gap — contractors can't hire enough people with the right RF background.",
    },
    "space": {
        "courses": [
            "Orbital Mechanics (MAE 589 special topics)",
            "Introduction to Flight (MAE 331)",
            "Propulsion (MAE 456)",
            "Dynamics (MAE 340)",
        ],
        "skills": ["orbital mechanics", "attitude control", "launch vehicle design", "space environment"],
        "tools": ["MATLAB/Simulink", "STK (Systems Tool Kit)", "Python (Astropy)"],
        "why": "Space is a new warfighting domain — DoD Space Force contracts are growing fast, and Northrop/Lockheed/Boeing all have major space divisions.",
    },
    "ISR": {
        "courses": [
            "Signals and Systems (ECE 346)",
            "Image Processing (ECE 537)",
            "Machine Learning (CS 461)",
            "Sensor Systems (ECE 489)",
        ],
        "skills": ["sensor fusion", "image processing", "target recognition", "data exploitation"],
        "tools": ["Python (OpenCV)", "MATLAB", "TensorFlow"],
        "why": "ISR (Intelligence, Surveillance, Reconnaissance) integrates sensors, AI, and platforms — a key growth area across all services.",
    },
    "stealth": {
        "courses": [
            "Electromagnetics (ECE 341)",
            "Aerodynamics II (MAE 434)",
            "Materials Science (MAE 225)",
            "Computational Methods (MAE 305)",
        ],
        "skills": ["RCS reduction", "RF absorbing materials", "shaping analysis", "EM simulation"],
        "tools": ["ANSYS HFSS", "CST Studio", "MATLAB"],
        "why": "Stealth is classified — but the underlying physics (EM, aerodynamics, materials) are open and teachable. B-21 and NGAD are active programs.",
    },
    "C2": {
        "courses": [
            "Networks (CS 352)",
            "Distributed Systems (CS 439)",
            "Human Factors (MAE 488)",
            "Systems Engineering (MAE 496)",
        ],
        "skills": ["distributed systems", "protocol design", "systems architecture", "human-machine interface"],
        "tools": ["Python", "Linux", "ROS", "Docker"],
        "why": "C2 systems tie everything together — systems engineers who understand both the warfighting mission and the software architecture are rare and valuable.",
    },
    "JADC2": {
        "courses": [
            "Networks (CS 352)",
            "Distributed Systems (CS 439)",
            "Systems Engineering (MAE 496)",
            "Machine Learning (CS 461)",
        ],
        "skills": ["cloud architecture", "edge computing", "network resilience", "data fusion"],
        "tools": ["Python", "Docker/Kubernetes", "AWS/Azure GovCloud"],
        "why": "JADC2 (Joint All-Domain Command and Control) is the DoD's biggest IT modernization effort — billions in contracts over the next decade.",
    },
    "communications": {
        "courses": [
            "Communication Theory (ECE 361)",
            "Wireless Communications (ECE 462)",
            "RF Circuits (ECE 441)",
            "Signals and Systems (ECE 346)",
        ],
        "skills": ["waveform design", "satellite comms", "software-defined radio", "link budget analysis"],
        "tools": ["GNU Radio", "MATLAB", "Python"],
        "why": "Resilient communications under contested conditions is a top DoD priority — every platform needs secure, jam-resistant comms.",
    },
    "nuclear": {
        "courses": [
            "Nuclear Engineering electives (if available)",
            "Thermodynamics (MAE 341)",
            "Materials Science (MAE 225)",
            "Radiation Physics (Physics 385)",
        ],
        "skills": ["nuclear physics basics", "radiation shielding", "thermal-hydraulics"],
        "tools": ["MCNP (Monte Carlo N-Particle)", "MATLAB"],
        "why": "Nuclear triad modernization (B-21, Columbia-class, Sentinel ICBM) is a multi-decade program — niche but extremely stable career path.",
    },
    "logistics": {
        "courses": [
            "Systems Engineering (MAE 496)",
            "Operations Research (IE 336)",
            "Supply Chain (Business elective)",
        ],
        "skills": ["supply chain modeling", "maintenance planning", "digital twin"],
        "tools": ["Python", "MATLAB", "Palantir Foundry basics"],
        "why": "Logistics is unglamorous but massive — sustainment contracts often exceed platform development contracts in total value.",
    },
    "sonar": {
        "courses": [
            "Acoustics (MAE special topics)",
            "Signals and Systems (ECE 346)",
            "Digital Signal Processing (ECE 448)",
            "Fluid Mechanics (MAE 432)",
        ],
        "skills": ["underwater acoustics", "signal processing", "array processing", "flow noise"],
        "tools": ["MATLAB", "Python (SciPy)"],
        "why": "Submarine and undersea warfare is a growing priority — General Dynamics and Raytheon both hire MAE/ECE grads for sonar programs.",
    },
}


# ---------------------------------------------------------------------------
# Rutgers research labs (verified — see sources in CLAUDE.md comments)
# ---------------------------------------------------------------------------

RUTGERS_LABS: list[dict] = [
    {
        "name": "Gas Dynamics Research Lab (GDRL)",
        "department": "MAE",
        "faculty": "Prof. Edward P. DeMauro",
        "relevant_keywords": ["hypersonics", "propulsion"],
        "description": (
            "Operates the Emil Buehler Supersonic Wind Tunnel and is building GANDALF, "
            "a Mach 8+ hypervelocity expansion tube coming online 2027. Core facility for "
            "high-speed aero and aerothermodynamics research at Rutgers."
        ),
        "why_apply": (
            "Hypersonics is the #1 growth area in defense contracts. Working here as a freshman "
            "puts you years ahead — DeMauro is an AIAA Associate Fellow with direct industry connections."
        ),
        "url": "https://mae.rutgers.edu/edward-demauro",
        "how_to_apply": "Email Prof. DeMauro directly with your transcript and a sentence on why hypersonics interests you. Mention AIAA membership.",
    },
    {
        "name": "SPACE Lab (Space Propulsion with Advanced Chemistry and Energetics)",
        "department": "MAE",
        "faculty": "Prof. Steven Berg",
        "relevant_keywords": ["propulsion", "space"],
        "description": (
            "Researches spacecraft and rocket propulsion, energetic propellants, plasma chemistry, "
            "and space vehicle environments. Focused on advancing both military and civil space access."
        ),
        "why_apply": (
            "Space Force contracts are growing fast. Propulsion experience here translates directly "
            "to Northrop, Aerojet Rocketdyne, and SpaceX internship pipelines."
        ),
        "url": "https://sites.rutgers.edu/space-lab/",
        "how_to_apply": "Check the lab website for open positions. Prof. Berg joined in 2023 and is actively building the group — good time to get in early.",
    },
    {
        "name": "X-Bai Research Group (Astrodynamics and Space Autonomy)",
        "department": "MAE",
        "faculty": "Prof. Xiaoli Bai",
        "relevant_keywords": ["space", "ISR", "autonomy", "C2"],
        "description": (
            "Astrodynamics, space situational awareness (SSA), space weather modeling, and autonomous "
            "proximity/rendezvous operations. Directly applicable to DoD Space Domain Awareness programs."
        ),
        "why_apply": (
            "Space Domain Awareness is a top Space Force priority. SSA research here maps directly to "
            "Northrop Grumman and Raytheon space division internships."
        ),
        "url": "http://x-bai.rutgers.edu/",
        "how_to_apply": "Email Prof. Bai with interest in astrodynamics or SSA. Background in math/physics helpful as a freshman.",
    },
    {
        "name": "Drone and Flight Control Lab",
        "department": "MAE",
        "faculty": "Prof. Laurent Burlion",
        "relevant_keywords": ["autonomy", "UAS", "VTOL"],
        "description": (
            "Nonlinear control for UAVs, spacecraft attitude control, flight envelope protection, "
            "and advanced controllers for fixed-wing and rotary-wing drones. Real hardware flight testing."
        ),
        "why_apply": (
            "You can fly real drones as a freshman here. Autonomy + UAS experience is the fastest path "
            "to internships at General Atomics, Northrop, and ARL."
        ),
        "url": "https://mae.rutgers.edu/laurent-burlion",
        "how_to_apply": "Join Rutgers AIAA first — Burlion is connected. Then email with drone/controls interest. Get your Part 107 before emailing.",
    },
    {
        "name": "Smart Structures and Adaptive Aeroelastics (Bilgen Group)",
        "department": "MAE",
        "faculty": "Prof. Onur Bilgen",
        "relevant_keywords": ["UAS", "VTOL", "propulsion", "stealth"],
        "description": (
            "Smart-material multi-physics systems applied to morphing aircraft, multi-rotor drones, "
            "fixed-wing, flapping-wing, and rotary-wing vehicles. Morphing structures have stealth and "
            "aerodynamic efficiency applications."
        ),
        "why_apply": (
            "Morphing structures are a differentiating skill — few undergrads have it. Bilgen is an ASME Fellow "
            "with strong industry connections in both defense and commercial aviation."
        ),
        "url": "https://mae.rutgers.edu/onur-bilgen",
        "how_to_apply": "Email Prof. Bilgen with interest in smart structures or morphing aircraft. SolidWorks or CAD experience helpful.",
    },
    {
        "name": "Communications and Signal Processing Lab (CSPL)",
        "department": "ECE",
        "faculty": "Prof. Athina P. Petropulu (IEEE Fellow)",
        "relevant_keywords": ["radar", "ISR", "electronic warfare", "communications"],
        "description": (
            "MIMO radar, compressive radar imaging, physical layer security, and statistical signal processing. "
            "Petropulu is an IEEE AESS member — her radar work is directly funded by and relevant to DoD."
        ),
        "why_apply": (
            "Radar is Raytheon's core business and L3Harris's biggest hiring area. "
            "Working with an IEEE Fellow on MIMO radar as an undergrad is resume gold."
        ),
        "url": "http://eceweb1.rutgers.edu/~cspl/",
        "how_to_apply": "Email Prof. Petropulu with interest in radar signal processing. MATLAB and probability background helpful — take ECE 226 first.",
    },
    {
        "name": "WINLAB (Wireless Information Network Laboratory)",
        "department": "ECE",
        "faculty": "Prof. Dipankar Raychaudhuri (Director); Ivan Seskar (Chief Technologist)",
        "relevant_keywords": ["communications", "C2", "JADC2", "electronic warfare", "cyber"],
        "description": (
            "30-year NSF/DARPA/ARL/NRL-funded lab operating the ORBIT open wireless testbed — one of the world's "
            "largest open wireless research platforms. Research in cognitive radio, SDR, dynamic spectrum access, "
            "and network resilience. Assisted DARPA on the Spectrum Challenge."
        ),
        "why_apply": (
            "WINLAB has active DoD funding from DARPA, ARL, and NRL — rare for a university lab. "
            "JADC2 is a multi-billion-dollar program and WINLAB's spectrum work is directly relevant."
        ),
        "url": "https://www.winlab.rutgers.edu/",
        "how_to_apply": "Check winlab.rutgers.edu for open positions. The lab is large — reach out to Ivan Seskar directly for undergraduate involvement.",
    },
    {
        "name": "INSPIRE Lab",
        "department": "ECE",
        "faculty": "Prof. Waheed U. Bajwa (IEEE Fellow 2025)",
        "relevant_keywords": ["radar", "ISR", "AI/ML", "communications"],
        "description": (
            "Compressed sensing, high-dimensional statistical inference, radar signal processing, "
            "and distributed wireless sensor networks. Adversarial ML and radar imaging applications."
        ),
        "why_apply": (
            "Compressed sensing + ML for radar is one of the most in-demand skill combinations at "
            "defense primes. Bajwa is a rising star — getting in his group early is a significant advantage."
        ),
        "url": "https://ece.rutgers.edu/waheed-bajwa",
        "how_to_apply": "Email Prof. Bajwa after taking linear algebra and probability. Mention interest in radar or distributed sensing.",
    },
    {
        "name": "DAISY Lab (Data Analysis and Information SecuritY)",
        "department": "ECE",
        "faculty": "Prof. Yingying Chen (ACM/IEEE/NAI Fellow, ECE Chair)",
        "relevant_keywords": ["cyber", "AI/ML", "communications"],
        "description": (
            "Applied ML for mobile security, IoT security, adversarial AI, and cyber-physical system security. "
            "300+ peer-reviewed publications. Affiliated with WINLAB."
        ),
        "why_apply": (
            "Led by the ECE Department Chair — visibility is high. Cyber + AI/ML skills are the most "
            "cross-applicable across all defense contractors and government agencies."
        ),
        "url": "https://www.winlab.rutgers.edu/~yychen/",
        "how_to_apply": "Competitive group — take CS 419 (Computer Security) and build a Python portfolio first. Apply end of freshman year.",
    },
    {
        "name": "PRACSYS Lab (Algorithmic Robotics)",
        "department": "CS",
        "faculty": "Prof. Kostas Bekris",
        "relevant_keywords": ["autonomy", "logistics", "AI/ML"],
        "description": (
            "Robot planning, data-driven control, perception, and manipulation. Applications in logistics "
            "automation and field robotics. Rutgers CS ranked #1 globally in robotics (CSRankings 2022)."
        ),
        "why_apply": (
            "Autonomy + logistics is where massive DoD contracts are flowing right now. "
            "Bekris is also an Amazon Scholar — opens both defense and commercial pipelines."
        ),
        "url": "https://pracsys.cs.rutgers.edu/",
        "how_to_apply": "Email Prof. Bekris with a GitHub link showing robotics or ML work. ROS or Python experience helpful.",
    },
    {
        "name": "Algorithmic Robotics and Control Lab (ARC-L)",
        "department": "CS",
        "faculty": "Prof. Jingjin Yu",
        "relevant_keywords": ["autonomy", "UAS", "AI/ML"],
        "description": (
            "Multi-robot path planning, swarm coordination, sensor deployment, and sensor fusion "
            "with provable algorithmic guarantees. Applicable to swarm UAS operations."
        ),
        "why_apply": (
            "Swarm UAS is a DARPA and Air Force Research Lab focus area. Algorithmic guarantees on "
            "multi-agent systems is a rare research angle that stands out in applications."
        ),
        "url": "https://arc-l.github.io/",
        "how_to_apply": "Email Prof. Yu with interest in multi-robot systems. Strong algorithms background helpful — take CS 344 early.",
    },
]


# ---------------------------------------------------------------------------
# Rutgers student clubs
# ---------------------------------------------------------------------------

CLUBS: list[ClubInfo] = [
    {
        "name": "Rutgers AIAA Student Chapter",
        "description": "American Institute of Aeronautics and Astronautics — design competitions, industry speaker series, and the path to AIAA conferences where recruiters from every prime contractor show up.",
        "relevant_keywords": ["hypersonics", "propulsion", "UAS", "space", "VTOL", "stealth"],
        "how_to_join": "Search 'Rutgers AIAA' on RU Student Organizations — meetings typically start Week 2 of fall semester.",
    },
    {
        "name": "Rutgers Rocketry Team",
        "description": "Competes in Intercollegiate Rocket Engineering Competition (IREC/Spaceport America Cup). Hands-on propulsion, structures, and avionics experience that directly maps to defense contractor work.",
        "relevant_keywords": ["propulsion", "space", "UAS", "autonomy"],
        "how_to_join": "Apply during club fair or directly via the team's Instagram/Discord — look for 'Rutgers Rocketry' on GitHub too.",
    },
    {
        "name": "Rutgers Autonomous Vehicle Systems (RAVS)",
        "description": "Builds autonomous ground and air vehicles. Strong pipeline to internships at autonomy-focused defense programs.",
        "relevant_keywords": ["autonomy", "AI/ML", "UAS", "C2"],
        "how_to_join": "Club fair or search RU involvement network. Accepts freshmen with coding or mechanical interest.",
    },
    {
        "name": "IEEE Rutgers Student Branch",
        "description": "Covers all of ECE — relevant working groups on robotics, communications, and signal processing directly map to defense electronics roles.",
        "relevant_keywords": ["radar", "electronic warfare", "communications", "cyber", "JADC2"],
        "how_to_join": "ieee.rutgers.edu — free student IEEE membership ($20/yr) opens national conference access.",
    },
    {
        "name": "Rutgers Cybersecurity Club (RUSEC)",
        "description": "CTF competitions, security research, and DoD Cyber Scholarship Program connections. Many members go on to cleared positions.",
        "relevant_keywords": ["cyber", "C2", "JADC2", "communications"],
        "how_to_join": "discord.gg/rusec or search on RU Involvement Network.",
    },
    {
        "name": "Society of Women Engineers (SWE) Rutgers",
        "description": "Industry networking, mentorship, and scholarship access — Boeing, Lockheed, and Raytheon sponsor SWE heavily and use it as a recruiting pipeline.",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "space", "UAS"],
        "how_to_join": "swe.rutgers.edu — open to all students as allies.",
    },
    {
        "name": "Rutgers Human Factors and Ergonomics Society (HFES)",
        "description": "Human-machine interface and systems design — growing relevance in autonomous systems and C2 platforms.",
        "relevant_keywords": ["autonomy", "C2", "JADC2", "ISR"],
        "how_to_join": "Search RU Involvement Network for HFES.",
    },
]


# ---------------------------------------------------------------------------
# Scholarships worth applying to as an AAE student
# ---------------------------------------------------------------------------

SCHOLARSHIPS: list[ScholarshipInfo] = [
    {
        "name": "SMART Scholarship",
        "sponsor": "DoD STEM",
        "amount": "Full tuition + $25k–$38k/yr stipend",
        "deadline_note": "August annually — apply sophomore year",
        "url": "https://www.smartscholarship.org",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "cyber", "radar", "space"],
    },
    {
        "name": "NDSEG Fellowship",
        "sponsor": "DoD",
        "amount": "$38k/yr + full tuition (graduate)",
        "deadline_note": "December annually — for grad school, plan ahead",
        "url": "https://ndseg.sysplus.com",
        "relevant_keywords": ["hypersonics", "directed energy", "propulsion", "autonomy", "AI/ML"],
    },
    {
        "name": "Brooke Owens Fellowship",
        "sponsor": "Brooke Owens Fund",
        "amount": "Paid internship + mentorship",
        "deadline_note": "January annually — sophomore/junior year, for women and gender minorities",
        "url": "https://www.brookeowensfellowship.com",
        "relevant_keywords": ["space", "UAS", "propulsion", "autonomy"],
    },
    {
        "name": "Palantir Women in Technology Scholarship",
        "sponsor": "Palantir",
        "amount": "$7,000",
        "deadline_note": "Rolling — apply sophomore year",
        "url": "https://www.palantir.com/careers/students/scholarship/wit/",
        "relevant_keywords": ["AI/ML", "JADC2", "ISR", "C2", "autonomy"],
    },
    {
        "name": "AFCEA Scholarship",
        "sponsor": "Armed Forces Communications and Electronics Association",
        "amount": "$2,500–$5,000",
        "deadline_note": "February annually — freshman eligible",
        "url": "https://www.afcea.org/scholarships",
        "relevant_keywords": ["communications", "cyber", "C2", "JADC2", "radar", "electronic warfare"],
    },
    {
        "name": "Zonta Amelia Earhart Fellowship",
        "sponsor": "Zonta International",
        "amount": "$10,000 (graduate)",
        "deadline_note": "November annually — for graduate women in aerospace",
        "url": "https://www.zonta.org/fellowships",
        "relevant_keywords": ["space", "hypersonics", "propulsion", "UAS"],
    },
]


# ---------------------------------------------------------------------------
# Semester-by-semester career action plan for an AAE freshman
# ---------------------------------------------------------------------------

CAREER_TIMELINE: list[CollegeAction] = [
    {
        "year": "Freshman Fall",
        "action": "Join AIAA and one hands-on club (Rocketry or RAVS). Get FAA Part 107 drone license — takes 2–3 weeks of study, $175 exam fee, and immediately differentiates your resume.",
        "rationale": "Clubs and certifications are the fastest way to build a resume before you have coursework to show.",
        "relevant_keywords": ["UAS", "propulsion", "autonomy"],
    },
    {
        "year": "Freshman Spring",
        "action": "Cold-email 2–3 MAE/ECE professors whose research aligns with top-funded tech domains. Ask for a 20-minute meeting. Aim to join a lab by summer.",
        "rationale": "Research experience as a freshman is rare — most students wait until junior year. Getting in early means 3 years of publications and references.",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "space"],
    },
    {
        "year": "Freshman Summer",
        "action": "Apply to DoD lab programs: AFRL Scholar, NRL SFRP, ARL SREP, or NUWC internships — many accept freshmen. Also look at Rutgers ODESSA for on-campus defense research funding.",
        "rationale": "DoD labs offer clearance-sponsoring internships that private employers can't match early-career. Getting in the pipeline freshman year is a major advantage.",
        "relevant_keywords": ["hypersonics", "directed energy", "propulsion", "autonomy", "cyber", "radar"],
    },
    {
        "year": "Sophomore Fall",
        "action": "Apply for SMART Scholarship (deadline August). Start building a GitHub portfolio with engineering projects (flight sim, CFD scripts, controls). Attend AIAA SciTech Forum virtually.",
        "rationale": "SMART pays full tuition and gives you a guaranteed DoD job — apply as early as eligible. GitHub presence matters to defense tech companies.",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "space"],
    },
    {
        "year": "Sophomore Spring",
        "action": "Apply to prime contractor internships for summer (Northrop, Raytheon, Lockheed, Boeing, L3Harris). Apply to Brooke Owens Fellowship if eligible. Take your first elective in your target domain.",
        "rationale": "Contractor internships open clearance pathways and convert to return offers. The best ones require applications in January–February.",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "UAS", "space"],
    },
    {
        "year": "Junior Year",
        "action": "Target a Secret clearance sponsor through your internship. Submit to AIAA student paper competition. If grad school is a possibility, begin NDSEG/NSF fellowship research.",
        "rationale": "A clearance takes 12–18 months — starting the process junior year means you have it by graduation, which dramatically increases job offers.",
        "relevant_keywords": ["hypersonics", "directed energy", "autonomy", "cyber", "radar", "space"],
    },
    {
        "year": "Senior Year",
        "action": "Capstone project should be in your target domain — coordinate with a sponsor company if possible (many primes co-sponsor capstones). Lock in return offer or grad school acceptance.",
        "rationale": "Co-sponsored capstones become portfolio pieces and often lead directly to return offers at the sponsoring company.",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "UAS", "space"],
    },
]


# ---------------------------------------------------------------------------
# What to apply to right now (freshman year specific)
# ---------------------------------------------------------------------------

APPLY_NOW: list[dict] = [
    {
        "what": "FAA Part 107 Remote Pilot Certificate",
        "type": "certification",
        "urgency": "Do it this semester",
        "effort": "2–3 weeks self-study, $175 exam fee",
        "payoff": "Instantly adds a line to your resume and lets you legally fly UAS for research or clubs.",
        "link": "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot",
        "relevant_keywords": ["UAS", "autonomy", "ISR"],
    },
    {
        "what": "AFRL (Air Force Research Laboratory) Scholars Program",
        "type": "internship",
        "urgency": "Apply December–January for summer",
        "effort": "One application, GPA 3.0+ helpful",
        "payoff": "Paid DoD internship, clearance pipeline, direct exposure to hypersonics/directed energy/autonomy programs.",
        "link": "https://www.afrl.af.mil/Scholars/",
        "relevant_keywords": ["hypersonics", "directed energy", "autonomy", "propulsion", "AI/ML", "space"],
    },
    {
        "what": "NRL (Naval Research Laboratory) NREIP Program",
        "type": "internship",
        "urgency": "Apply November–January for summer",
        "effort": "ASEE application portal, need faculty reference",
        "payoff": "Paid federal internship at one of the best basic research labs in DoD — radar, sonar, materials, cyber.",
        "link": "https://nreip.asee.org",
        "relevant_keywords": ["radar", "sonar", "cyber", "directed energy", "electronic warfare", "space"],
    },
    {
        "what": "ARL (Army Research Laboratory) SFFP / SREP",
        "type": "internship",
        "urgency": "Apply December–February for summer",
        "effort": "ASEE application portal",
        "payoff": "Army lab focus areas include autonomy, propulsion, materials, and C2 — Adelphi, MD location is close to Rutgers.",
        "link": "https://www.arl.army.mil/opportunities/",
        "relevant_keywords": ["autonomy", "propulsion", "C2", "AI/ML", "communications"],
    },
    {
        "what": "AFCEA Scholarship Application",
        "type": "scholarship",
        "urgency": "Apply by February annually",
        "effort": "Essay + transcript, freshman eligible",
        "payoff": "$2,500–$5,000 + AFCEA membership opens networking events with defense industry.",
        "link": "https://www.afcea.org/scholarships",
        "relevant_keywords": ["communications", "cyber", "C2", "JADC2", "radar"],
    },
    {
        "what": "Rutgers Undergraduate Research Fellowship (URF)",
        "type": "funding",
        "urgency": "Apply in spring for next academic year",
        "effort": "Requires faculty sponsor — find one first semester",
        "payoff": "Paid stipend to do research with a professor, builds publications record early.",
        "link": "https://sasundergrad.rutgers.edu/research/fellowships-and-awards/undergraduate-research-fellowships",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "UAS", "space"],
    },
    {
        "what": "Rutgers AIAA Chapter",
        "type": "club",
        "urgency": "Join Week 1 or 2 of semester",
        "effort": "Show up to first meeting",
        "payoff": "Design competition, industry speakers, automatic network at every prime contractor.",
        "link": "https://rutgers.campusgroups.com",
        "relevant_keywords": ["hypersonics", "propulsion", "UAS", "space", "VTOL"],
    },
]


# ---------------------------------------------------------------------------
# Major → relevant tech domains mapping (school-agnostic)
# ---------------------------------------------------------------------------

MAJOR_DOMAINS: dict[str, dict] = {
    "Aerospace Engineering": {
        "keywords": ["hypersonics", "propulsion", "UAS", "VTOL", "space", "stealth", "ISR", "autonomy"],
        "description": "Directly maps to the highest-funded defense domains. Hypersonics, propulsion, and UAS are all top-5 contract areas.",
        "generic_courses": ["Aerodynamics", "Gas Dynamics / Compressible Flow", "Flight Dynamics & Control", "Orbital Mechanics", "Propulsion Systems", "Structures", "CFD"],
    },
    "Mechanical Engineering": {
        "keywords": ["propulsion", "hypersonics", "VTOL", "logistics", "autonomy", "UAS"],
        "description": "Strong overlap with propulsion, thermal systems, and autonomous vehicles. Less direct than AE but very employable.",
        "generic_courses": ["Thermodynamics", "Fluid Mechanics", "Heat Transfer", "Dynamics & Control", "Manufacturing", "Robotics"],
    },
    "Electrical Engineering": {
        "keywords": ["radar", "electronic warfare", "communications", "C2", "directed energy", "ISR", "cyber"],
        "description": "Radar, EW, and communications are Raytheon and L3Harris's core business — EE grads are their primary hire.",
        "generic_courses": ["Electromagnetics", "Signals & Systems", "Digital Signal Processing", "RF Circuits", "Antenna Theory", "Communications Theory"],
    },
    "Computer Science": {
        "keywords": ["AI/ML", "autonomy", "cyber", "C2", "JADC2", "ISR"],
        "description": "AI/ML and cyber are the fastest-growing areas in DoD spending. CS grads command premiums at every prime contractor.",
        "generic_courses": ["Machine Learning", "Computer Security", "Operating Systems", "Distributed Systems", "Algorithms", "Computer Vision"],
    },
    "Computer Engineering": {
        "keywords": ["cyber", "C2", "communications", "AI/ML", "electronic warfare", "autonomy"],
        "description": "Bridge between hardware and software — embedded systems in weapons platforms is a major gap DoD is trying to fill.",
        "generic_courses": ["Embedded Systems", "Digital Design", "Computer Architecture", "Real-Time Systems", "FPGAs", "Networking"],
    },
    "Systems Engineering": {
        "keywords": ["C2", "JADC2", "logistics", "autonomy", "ISR"],
        "description": "Systems engineers are needed for every major program — you work across all domains rather than specializing in one.",
        "generic_courses": ["Systems Architecture", "Requirements Engineering", "Modeling & Simulation", "Human Factors", "Reliability", "Test & Evaluation"],
    },
    "Physics": {
        "keywords": ["directed energy", "nuclear", "radar", "space", "hypersonics"],
        "description": "Directed energy and nuclear are physics-heavy domains with few qualified engineers — high demand, lower competition.",
        "generic_courses": ["Electromagnetism", "Quantum Mechanics", "Nuclear Physics", "Optics / Photonics", "Plasma Physics", "Thermodynamics"],
    },
    "Nuclear Engineering": {
        "keywords": ["nuclear", "propulsion", "space"],
        "description": "Nuclear triad modernization is a multi-decade program. Niche but extremely stable — very few universities offer this degree.",
        "generic_courses": ["Nuclear Reactor Theory", "Radiation Shielding", "Thermal-Hydraulics", "Nuclear Materials", "MCNP Simulation"],
    },
    "Ocean / Marine Engineering": {
        "keywords": ["sonar", "autonomy", "UAS", "C2", "communications"],
        "description": "Undersea warfare is a growing DoD priority. General Dynamics and Raytheon hire ocean engineers for submarine programs.",
        "generic_courses": ["Underwater Acoustics", "Fluid Mechanics", "Ocean Structures", "Marine Propulsion", "Hydrodynamics"],
    },
    "Chemical Engineering": {
        "keywords": ["propulsion", "nuclear", "directed energy"],
        "description": "Energetics and propellant chemistry is a niche area with consistent DoD funding — General Atomics and Aerojet Rocketdyne are top employers.",
        "generic_courses": ["Thermodynamics", "Reaction Engineering", "Transport Phenomena", "Materials Science", "Process Control"],
    },
    "Mathematics / Applied Math": {
        "keywords": ["AI/ML", "autonomy", "cyber", "C2", "radar"],
        "description": "Strong math background is prized in AI, cryptography, and signal processing roles — pairs well with a technical minor.",
        "generic_courses": ["Linear Algebra", "Probability & Statistics", "Numerical Methods", "Differential Equations", "Optimization", "Cryptography"],
    },
    "Cybersecurity": {
        "keywords": ["cyber", "C2", "JADC2", "communications"],
        "description": "Dedicated cyber programs are still rare — graduates are in very high demand across all DoD branches and intelligence agencies.",
        "generic_courses": ["Network Security", "Penetration Testing", "Reverse Engineering", "Cryptography", "Malware Analysis", "Incident Response"],
    },
}


# ---------------------------------------------------------------------------
# School database: top programs per defense tech domain
# ---------------------------------------------------------------------------

SCHOOL_DATABASE: list[dict] = [
    # ---- HYPERSONICS / AERODYNAMICS ----
    {
        "name": "Georgia Tech",
        "full_name": "Georgia Institute of Technology",
        "location": "Atlanta, GA",
        "relevant_keywords": ["hypersonics", "propulsion", "UAS", "autonomy", "radar", "electronic warfare", "AI/ML", "space", "stealth", "C2"],
        "strong_majors": ["Aerospace Engineering", "Electrical Engineering", "Computer Science", "Mechanical Engineering"],
        "defense_strength": "top_5",
        "why": "GTRI (Georgia Tech Research Institute) is one of the largest DoD-funded university research centers in the country. Strong across hypersonics, radar, EW, and autonomy. Consistently ranks #1 or #2 for defense research funding among universities.",
        "notable_programs": ["GTRI (Georgia Tech Research Institute)", "School of Aerospace Engineering", "Institute for Robotics & Intelligent Machines (IRIM)"],
        "defense_connections": "AFRL, DARPA, ARL, Lockheed, Northrop, Raytheon all recruit heavily. Atlanta proximity to Dobbins ARB.",
        "url": "https://www.gatech.edu",
    },
    {
        "name": "MIT",
        "full_name": "Massachusetts Institute of Technology",
        "location": "Cambridge, MA",
        "relevant_keywords": ["hypersonics", "propulsion", "autonomy", "AI/ML", "space", "nuclear", "radar", "cyber", "directed energy", "C2", "JADC2"],
        "strong_majors": ["Aerospace Engineering", "Electrical Engineering", "Computer Science", "Nuclear Engineering", "Physics"],
        "defense_strength": "top_5",
        "why": "MIT Lincoln Laboratory is adjacent to campus and one of the premier DoD FFRDC labs — students can work there while enrolled. Broad strength across all defense domains.",
        "notable_programs": ["MIT Lincoln Laboratory (FFRDC)", "AeroAstro Dept", "CSAIL", "Nuclear Science & Engineering"],
        "defense_connections": "Lincoln Lab, DARPA, NRL, ARL. Nearly every prime contractor recruits on campus.",
        "url": "https://www.mit.edu",
    },
    {
        "name": "Purdue University",
        "full_name": "Purdue University",
        "location": "West Lafayette, IN",
        "relevant_keywords": ["propulsion", "hypersonics", "UAS", "space", "nuclear", "autonomy", "AI/ML"],
        "strong_majors": ["Aerospace Engineering", "Nuclear Engineering", "Mechanical Engineering", "Computer Science"],
        "defense_strength": "top_10",
        "why": "Purdue's AAE department is among the best in the world — cradle of astronauts and propulsion engineers. Zucrow Laboratories is one of the premier university propulsion research facilities.",
        "notable_programs": ["Zucrow Laboratories (propulsion)", "School of Aeronautics & Astronautics", "Nuclear Engineering"],
        "defense_connections": "Strong Air Force and NASA ties. Rolls-Royce, GE Aerospace, Northrop, Boeing all recruit heavily.",
        "url": "https://www.purdue.edu",
    },
    {
        "name": "Caltech",
        "full_name": "California Institute of Technology",
        "location": "Pasadena, CA",
        "relevant_keywords": ["hypersonics", "propulsion", "space", "directed energy", "autonomy"],
        "strong_majors": ["Aerospace Engineering", "Physics", "Mechanical Engineering"],
        "defense_strength": "top_5",
        "why": "GALCIT (Graduate Aerospace Laboratories) invented modern rocketry. Proximity to JPL and heavy DoD/NASA research. Small school but extraordinary per-capita research output.",
        "notable_programs": ["GALCIT (Graduate Aerospace Laboratories)", "JPL affiliation"],
        "defense_connections": "JPL, AFRL, Northrop Grumman (HQ nearby). Major space and hypersonics programs.",
        "url": "https://www.caltech.edu",
    },
    {
        "name": "University of Michigan",
        "full_name": "University of Michigan — Ann Arbor",
        "location": "Ann Arbor, MI",
        "relevant_keywords": ["autonomy", "propulsion", "space", "nuclear", "AI/ML", "UAS", "radar", "cyber"],
        "strong_majors": ["Aerospace Engineering", "Computer Science", "Electrical Engineering", "Nuclear Engineering", "Mechanical Engineering"],
        "defense_strength": "top_10",
        "why": "Top-ranked AE and nuclear programs. Strong autonomous systems research. Michigan is the only Big Ten school with a nuclear engineering program ranked in the top 5.",
        "notable_programs": ["College of Engineering", "Michigan Institute for Computational Discovery & Engineering", "Ford Motor Co. Robotics Building"],
        "defense_connections": "ARL, Air Force Research, Lockheed, Boeing, General Dynamics.",
        "url": "https://umich.edu",
    },
    # ---- RADAR / EW / SIGNALS ----
    {
        "name": "Ohio State University",
        "full_name": "Ohio State University",
        "location": "Columbus, OH",
        "relevant_keywords": ["radar", "electronic warfare", "communications", "ISR", "directed energy"],
        "strong_majors": ["Electrical Engineering", "Computer Science"],
        "defense_strength": "top_10",
        "why": "The ElectroScience Laboratory (ESL) at Ohio State is one of the most recognized university radar and antenna research centers in the world. Direct ties to AFRL Wright-Patterson AFB (20 min away).",
        "notable_programs": ["ElectroScience Laboratory (ESL)", "Translational Data Analytics Institute"],
        "defense_connections": "AFRL Wright-Patterson AFB is 20 minutes away — most ESL students work there. Raytheon and L3Harris recruit heavily.",
        "url": "https://www.osu.edu",
    },
    {
        "name": "University of Texas at Austin",
        "full_name": "University of Texas at Austin",
        "location": "Austin, TX",
        "relevant_keywords": ["radar", "communications", "autonomy", "propulsion", "space", "hypersonics", "C2"],
        "strong_majors": ["Aerospace Engineering", "Electrical Engineering", "Computer Science"],
        "defense_strength": "top_10",
        "why": "Applied Research Laboratories (ARL:UT) is a major DoD-funded center for sonar, radar, and communications. Strong AE and EE programs with direct DoD lab affiliation.",
        "notable_programs": ["Applied Research Laboratories (ARL:UT)", "Cockrell School of Engineering"],
        "defense_connections": "ARL:UT (DoD UARC), NRL affiliation, strong Texas defense industry (L3Harris, Lockheed Fort Worth).",
        "url": "https://www.utexas.edu",
    },
    {
        "name": "Virginia Tech",
        "full_name": "Virginia Polytechnic Institute and State University",
        "location": "Blacksburg, VA",
        "relevant_keywords": ["communications", "radar", "electronic warfare", "cyber", "autonomy", "UAS", "C2"],
        "strong_majors": ["Electrical Engineering", "Aerospace Engineering", "Computer Science", "Computer Engineering"],
        "defense_strength": "top_10",
        "why": "MPRG (Mobile and Portable Radio Research Group) is one of the world's leading wireless communications research labs. Northern Virginia campus puts students near the Pentagon and major defense contractors.",
        "notable_programs": ["Hume Center for National Security & Technology", "MPRG (wireless comms)", "Virginia Space Grant Consortium"],
        "defense_connections": "Pentagon corridor, MITRE, SAIC, Leidos, Booz Allen all hire heavily. Hume Center has active DoD programs.",
        "url": "https://www.vt.edu",
    },
    # ---- AUTONOMY / ROBOTICS / AI ----
    {
        "name": "Carnegie Mellon University",
        "full_name": "Carnegie Mellon University",
        "location": "Pittsburgh, PA",
        "relevant_keywords": ["autonomy", "AI/ML", "cyber", "C2", "JADC2", "logistics", "ISR"],
        "strong_majors": ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Systems Engineering"],
        "defense_strength": "top_5",
        "why": "CMU's Robotics Institute is the #1 ranked robotics program in the world. CyLab is one of the top cybersecurity research centers globally. NREC (National Robotics Engineering Center) does applied DoD robotics.",
        "notable_programs": ["Robotics Institute", "CyLab (cybersecurity)", "NREC (DoD robotics)", "Software Engineering Institute (SEI — FFRDC)"],
        "defense_connections": "SEI is a DoD FFRDC. DARPA, ARL, NRL all fund CMU research. Every prime contractor recruits.",
        "url": "https://www.cmu.edu",
    },
    {
        "name": "Stanford University",
        "full_name": "Stanford University",
        "location": "Stanford, CA",
        "relevant_keywords": ["autonomy", "AI/ML", "space", "propulsion", "ISR", "C2"],
        "strong_majors": ["Aerospace Engineering", "Computer Science", "Electrical Engineering"],
        "defense_strength": "top_10",
        "why": "Top AI/ML research globally — strong crossover to defense autonomy. Stanford AeroAstro has deep NASA and AFRL connections. SRI International (defense-adjacent) is nearby.",
        "notable_programs": ["HAI (Human-Centered AI)", "AeroAstro", "Stanford Space Rendezvous Lab"],
        "defense_connections": "DARPA funding, Lockheed Advanced Development (Skunk Works) in Palmdale, SRI International.",
        "url": "https://www.stanford.edu",
    },
    {
        "name": "University of Illinois Urbana-Champaign",
        "full_name": "University of Illinois at Urbana-Champaign",
        "location": "Urbana, IL",
        "relevant_keywords": ["AI/ML", "cyber", "autonomy", "communications", "radar", "C2"],
        "strong_majors": ["Computer Science", "Electrical Engineering", "Aerospace Engineering"],
        "defense_strength": "top_10",
        "why": "UIUC CS and ECE are consistently top-5 ranked. Information Trust Institute is a major DoD/DHS cybersecurity center. Strong AI research with direct defense applications.",
        "notable_programs": ["Information Trust Institute", "Coordinated Science Lab", "Beckman Institute"],
        "defense_connections": "DARPA, DHS, NSA fund research. Proximity to Scott AFB and Chanute Air Force history. Major tech company recruiting.",
        "url": "https://illinois.edu",
    },
    # ---- CYBER ----
    {
        "name": "University of Maryland",
        "full_name": "University of Maryland — College Park",
        "location": "College Park, MD",
        "relevant_keywords": ["cyber", "AI/ML", "space", "hypersonics", "C2", "autonomy", "ISR"],
        "strong_majors": ["Computer Science", "Electrical Engineering", "Aerospace Engineering", "Cybersecurity"],
        "defense_strength": "top_5",
        "why": "Location is everything — UMD is 10 miles from NSA headquarters and 20 miles from the Pentagon. UMIACS is a major research center. Strong joint hypersonics research with DoD.",
        "notable_programs": ["UMIACS (computer science)", "Maryland Cybersecurity Center (MC2)", "Joint Hypersonics Transition Program (DoD-funded)"],
        "defense_connections": "NSA, NRL, APL (Johns Hopkins-affiliated but nearby), DARPA. Most defense intel community agencies recruit from UMD.",
        "url": "https://umd.edu",
    },
    {
        "name": "Johns Hopkins University",
        "full_name": "Johns Hopkins University",
        "location": "Baltimore, MD",
        "relevant_keywords": ["cyber", "AI/ML", "ISR", "autonomy", "C2", "space"],
        "strong_majors": ["Computer Science", "Electrical Engineering", "Systems Engineering", "Applied Mathematics"],
        "defense_strength": "top_5",
        "why": "APL (Applied Physics Laboratory) is one of the largest DoD UARCs in the country and is directly affiliated with JHU. Students can work there as undergrads. Focus on missiles, space, cyber, and ISR.",
        "notable_programs": ["APL — Johns Hopkins Applied Physics Laboratory (DoD UARC)", "Whiting School of Engineering"],
        "defense_connections": "APL is a DoD UARC — extremely close pipeline to cleared work. Navy, Missile Defense Agency, DARPA.",
        "url": "https://www.jhu.edu",
    },
    # ---- NUCLEAR ----
    {
        "name": "Penn State University",
        "full_name": "Pennsylvania State University",
        "location": "University Park, PA",
        "relevant_keywords": ["nuclear", "propulsion", "radar", "communications", "cyber", "electronic warfare"],
        "strong_majors": ["Nuclear Engineering", "Mechanical Engineering", "Electrical Engineering", "Aerospace Engineering"],
        "defense_strength": "top_10",
        "why": "Penn State's Applied Research Laboratory (ARL/PSU) is a DoD UARC focused on naval warfare — sonar, underwater systems, propulsion. Strong nuclear and EE programs.",
        "notable_programs": ["Applied Research Laboratory (ARL/PSU — DoD UARC)", "Nuclear Engineering", "Computational & Data Sciences"],
        "defense_connections": "ARL/PSU (Navy UARC), Naval Nuclear Propulsion Program, NAVSEA.",
        "url": "https://www.psu.edu",
    },
    # ---- AVIATION / UAS ----
    {
        "name": "Embry-Riddle Aeronautical University",
        "full_name": "Embry-Riddle Aeronautical University",
        "location": "Daytona Beach, FL / Prescott, AZ",
        "relevant_keywords": ["UAS", "VTOL", "propulsion", "autonomy", "space", "ISR"],
        "strong_majors": ["Aerospace Engineering", "Mechanical Engineering", "Computer Science"],
        "defense_strength": "top_10",
        "why": "Most specialized aviation/aerospace university in the US. UAS research is a core focus. High placement rate at defense aviation contractors. Multiple campuses near military bases.",
        "notable_programs": ["BEYOND Center for UAS Research", "Eagle Flight Research Center", "Daytona Beach & Prescott campuses"],
        "defense_connections": "Co-located with Daytona Beach International Airport. Strong Air Force and Navy aviation contractor pipeline. General Atomics, Northrop UAS divisions.",
        "url": "https://www.erau.edu",
    },
    # ---- SPACE ----
    {
        "name": "University of Colorado Boulder",
        "full_name": "University of Colorado Boulder",
        "location": "Boulder, CO",
        "relevant_keywords": ["space", "propulsion", "autonomy", "communications", "ISR"],
        "strong_majors": ["Aerospace Engineering", "Electrical Engineering", "Physics"],
        "defense_strength": "top_10",
        "why": "LASP (Laboratory for Atmospheric and Space Physics) is one of the premier space research labs in the world. Boulder is a hub for the space industry — Ball Aerospace, Lockheed Space, United Launch Alliance all headquartered nearby.",
        "notable_programs": ["LASP (Laboratory for Atmospheric and Space Physics)", "Colorado Space Grant Consortium"],
        "defense_connections": "Space Force Space Command is in Colorado Springs (1 hr south). Ball Aerospace, Lockheed Martin Space, ULA, SNC all recruit heavily.",
        "url": "https://www.colorado.edu",
    },
    # ---- COMMUNICATIONS / WIRELESS ----
    {
        "name": "Rutgers University",
        "full_name": "Rutgers, The State University of New Jersey",
        "location": "New Brunswick, NJ",
        "relevant_keywords": ["communications", "C2", "JADC2", "electronic warfare", "cyber", "radar", "autonomy", "AI/ML", "hypersonics", "propulsion", "UAS", "space"],
        "strong_majors": ["Aerospace Engineering", "Electrical Engineering", "Computer Science", "Mechanical Engineering"],
        "defense_strength": "regional",
        "why": "WINLAB is one of the premier university wireless/spectrum research labs with active DARPA and ARL funding. Strong MAE program with hypersonics and UAS labs. Well-located for NJ/NY/PA defense employers.",
        "notable_programs": ["WINLAB (DARPA/ARL-funded wireless research)", "Gas Dynamics Research Lab (hypersonics)", "SPACE Lab", "CSPL (radar/signal processing)"],
        "defense_connections": "Lockheed Martin NJ, Boeing Philadelphia, L3Harris, BAE Systems NJ. NRL and ARL both within driving distance.",
        "url": "https://www.rutgers.edu",
    },
]

# Majors list for UI dropdowns
MAJORS_LIST = sorted(MAJOR_DOMAINS.keys())

# Schools list for UI dropdowns
SCHOOLS_LIST = sorted(set(s["name"] for s in SCHOOL_DATABASE))
