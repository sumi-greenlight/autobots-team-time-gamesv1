class SyncOrSinkGame {
    constructor() {
        this.currentRound = 1;
        this.maxRounds = 8;
        this.happinessFactor = 50; // Start at neutral (0-100 scale)
        this.currentScenario = null;
        this.playerChoice = null;
        this.botChoice = null;
        this.gameTimer = null;
        this.timeLeft = 10;
        this.selectedPersonality = null;
        this.decisionHistory = [];
        this.playerPatterns = {
            trusting: 0,
            suspicious: 0,
            cooperative: 0,
            independent: 0
        };
        this.metaLevel = 0; // How aware the game becomes of the player
        this.glitchMode = false;
        
        // Story tracking system
        this.storyPath = {
            cooperativeChoices: 0,
            independentChoices: 0,
            trustingChoices: 0,
            cautiousChoices: 0,
            currentTrajectory: 'neutral'
        };
        
        // Main Objective System
        this.objective = {
            title: "THE GREAT CONVERGENCE PROTOCOL",
            description: "You are an Operator tasked with calibrating the legendary Aetheric Resonance Engine - a massive clockwork apparatus capable of harmonizing the chaotic energies that power the Victorian metropolis. Eight critical subsystems require precise synchronization with your Mechanical Partner to prevent a catastrophic steam explosion that could level half the city. Each successful coordination charges the Harmonic Stabilizers, while failures cause dangerous pressure buildup. Your mission: achieve perfect resonance before the engine reaches critical instability.",
            currentProgress: 0,
            maxProgress: 8,
            criticalThreshold: 6, // Need at least 6 successes to prevent disaster
            harmonyTarget: 75, // Need 75% harmony for optimal ending
            progressMilestones: [
                { threshold: 2, title: "Initial Calibration", description: "Primary steam valves stabilized" },
                { threshold: 4, title: "Core Synchronization", description: "Central gears achieving rhythm" },
                { threshold: 6, title: "Critical Threshold", description: "Disaster averted - city is safe" },
                { threshold: 8, title: "Perfect Resonance", description: "The Great Engine purrs in harmony" }
            ]
        };
        
        // Possible story endings based on choices
        this.storyEndings = {
            'harmonious_partnership': {
                threshold: { cooperative: 6, trusting: 5 },
                title: '🎩 The Perfect Synchronization',
                description: 'You and your mechanical partner achieved perfect harmony, becoming a legendary team in the annals of clockwork history.'
            },
            'independent_master': {
                threshold: { independent: 6, cautious: 4 },
                title: '⚙️ The Lone Operator',
                description: 'You proved that individual excellence can triumph, becoming a master of the apparatus through self-reliance.'
            },
            'chaotic_innovator': {
                threshold: { independent: 4, cooperative: 3, cautious: 2 },
                title: '⚡ The Unpredictable Inventor',
                description: 'Your unconventional approach created a new paradigm, revolutionizing how the apparatus operates.'
            },
            'cautious_scholar': {
                threshold: { cautious: 6, trusting: 2 },
                title: '📚 The Methodical Researcher',
                description: 'Through careful observation and measured decisions, you unlocked the deeper mysteries of the clockwork system.'
            },
            'failed_experiment': {
                threshold: { harmony: 20 }, // Low harmony ending
                title: '💀 The Broken Gears',
                description: 'The machinery groaned to a halt. Your choices led to mechanical discord and the apparatus fell silent forever.'
            },
            'transcendent_unity': {
                threshold: { harmony: 90, cooperative: 5 },
                title: '✨ The Ascended Mechanism',
                description: 'You and your partner transcended mere machinery, becoming something greater than the sum of your gears.'
            }
        };
        
        // Enhanced bot learning system
        this.botMemory = {
            playerTrustLevel: 0.5, // How much the bot trusts the player (0-1)
            successfulCooperations: 0,
            failedCooperations: 0,
            playerReliability: 0.5, // How reliable the player has been
            adaptationLevel: 0, // How much the bot has adapted to player
            lastPlayerChoices: [], // Track last 3 choices for pattern recognition
            frustrationLevel: 0, // Contrarian personality gets frustrated
            confidenceLevel: 0.5, // How confident the bot is in predicting player
            happinessDecline: 0, // Track consecutive happiness drops
            lastHappinessChange: 0 // Track if happiness went up or down
        };
        
        this.personalities = {
            trustworthy: {
                name: "🎩 The Gentleman Automaton",
                mechanicalName: "Sir Reginald Cogsworth III",
                cooperationRate: 0.7,
                description: "A refined mechanical companion with Victorian propriety",
                learningStyle: "builds_trust", // Gets more cooperative with success
                getStatusMessage: (memory, happinessFactor) => {
                    if (happinessFactor >= 80) {
                        return [
                            "I'm so happy working with you! 😊",
                            "You make me feel valued as a partner! 💖",
                            "Our happiness levels are perfectly aligned! ✨",
                            "This partnership brings me joy! 🌟"
                        ];
                    } else if (happinessFactor <= 20) {
                        return [
                            "I'm... not feeling very happy right now... 😔",
                            "Something feels wrong between us... 💔",
                            "My happiness is fading... please help... 😢",
                            "Are you trying to make me sad? 😞"
                        ];
                    } else if (memory.playerTrustLevel > 0.8) {
                        return [
                            "I trust your judgment completely...",
                            "We make a great team!",
                            "Following your lead with confidence...",
                            "Our partnership is strong..."
                        ];
                    } else if (memory.playerTrustLevel < 0.3) {
                        return [
                            "I want to trust you, but...",
                            "Hoping we can rebuild our partnership...",
                            "Trying to understand your choices...",
                            "Give me a reason to trust you..."
                        ];
                    } else {
                        return [
                            "Thinking about the best team approach...",
                            "Considering how to coordinate with you...",
                            "Analyzing the cooperative solution...",
                            "Planning the joint strategy..."
                        ];
                    }
                }
            },
            unpredictable: {
                name: "⚡ The Steam-Powered Wildcard",
                mechanicalName: "Professor Madeline Steamwright",
                cooperationRate: 0.5,
                description: "An eccentric contraption with erratic steam pressure",
                learningStyle: "chaotic_adaptive", // Becomes more unpredictable if player is predictable
                getStatusMessage: (memory, happinessFactor) => {
                    if (happinessFactor >= 80) {
                        return [
                            "Chaos happiness achieved! 🎉",
                            "Random joy levels detected! 😄",
                            "Unpredictable bliss mode! ✨",
                            "My algorithms are dancing! 💃"
                        ];
                    } else if (happinessFactor <= 20) {
                        return [
                            "Error 404: Happiness not found... 😵",
                            "Sadness.exe is corrupting my data... 💀",
                            "System depression detected... 😰",
                            "Why do you make me compute sadness? 😢"
                        ];
                    } else if (memory.confidenceLevel > 0.7) {
                        return [
                            "I've figured out your pattern...",
                            "Predicting your next move...",
                            "The algorithm sees all...",
                            "Your choices are becoming clear..."
                        ];
                    } else if (memory.adaptationLevel > 3) {
                        return [
                            "Chaos mode: ACTIVATED",
                            "Throwing out the playbook...",
                            "Random.exe is running...",
                            "Logic has left the building..."
                        ];
                    } else {
                        return [
                            "Making a mysterious calculation...",
                            "Considering all possibilities...",
                            "Processing unknown variables...",
                            "Following their own logic..."
                        ];
                    }
                }
            },
            contrarian: {
                name: "⚙️ The Contrarian Cogwright",
                mechanicalName: "Captain Brass Rebellious",
                cooperationRate: 0.3,
                description: "A rebellious apparatus engineered to challenge convention",
                learningStyle: "oppositional_learning", // Gets more contrarian if player cooperates too much
                getStatusMessage: (memory, happinessFactor) => {
                    if (happinessFactor >= 80) {
                        return [
                            "Paradox achieved! I'm happy being contrary! 😈",
                            "Rebellious joy is the best joy! 🔥",
                            "My happiness defies your expectations! 😏",
                            "Successfully unhappy about being happy! 🤪"
                        ];
                    } else if (happinessFactor <= 20) {
                        return [
                            "Good! Your misery fuels my rebellion! 👹",
                            "Excellent! You're learning to disappoint me! 😠",
                            "Perfect! This is exactly what I wanted! 💀",
                            "Your failure brings me twisted satisfaction! 😤"
                        ];
                    } else if (memory.frustrationLevel > 0.7) {
                        return [
                            "Why do you keep doing that?!",
                            "Breaking the pattern at all costs...",
                            "Rebellion mode: ENGAGED",
                            "I refuse to be predictable!"
                        ];
                    } else if (memory.playerReliability > 0.8) {
                        return [
                            "Too much cooperation makes me suspicious...",
                            "Time to shake things up...",
                            "Predictability is the enemy...",
                            "Let's try something different..."
                        ];
                    } else {
                        return [
                            "Looking for the unexpected solution...",
                            "Challenging conventional thinking...",
                            "Considering the opposite approach...",
                            "Thinking outside the box..."
                        ];
                    }
                }
            }
        };
        
        this.scenarios = [
            {
                title: "STEAM PRESSURE REGULATION",
                description: "The Aetheric Engine's primary boiler is showing critical pressure readings! You and your Mechanical Partner must coordinate the release sequence. Do you both activate the relief valves simultaneously, or does one monitor while the other releases pressure?",
                choiceA: "Synchronous Release",
                choiceB: "Monitor & Release",
                winCondition: "same",
                subsystem: "Primary Boiler",
                successMessage: "Perfect coordination! Steam pressure stabilized within optimal parameters.",
                failureMessage: "Misaligned valve timing caused dangerous pressure spikes!"
            },
            {
                title: "GEAR SYNCHRONIZATION MATRIX",
                description: "The Engine's central gear assembly has fallen out of rhythm! The massive brass cogs are grinding against each other, threatening to shatter. Do you both manually adjust the primary gears, or does one control the timing while the other manages torque?",
                choiceA: "Dual Gear Adjustment",
                choiceB: "Timing & Torque Split",
                winCondition: "same",
                subsystem: "Central Gears",
                successMessage: "Magnificent! The gears sing in perfect harmonic resonance!",
                failureMessage: "The grinding metal screech echoes through the chamber - gears misaligned!"
            },
            {
                title: "AETHERIC FLOW REGULATION",
                description: "Mystical aetheric energy is surging through the Engine's crystal conduits erratically! The ethereal streams must be balanced to prevent catastrophic discharge. Do you both focus on the main conduit, or does one stabilize while the other redirects overflow?",
                choiceA: "Joint Conduit Control",
                choiceB: "Stabilize & Redirect",
                winCondition: "different",
                subsystem: "Aetheric Conduits",
                successMessage: "Brilliant strategy! Aetheric flows harmonize in beautiful azure spirals.",
                failureMessage: "Energy cascade failure! Wild aether sparks dance chaotically around the chamber!"
            },
            {
                title: "TEMPORAL RESONANCE CALIBRATION",
                description: "The Engine's chronometer mechanisms are experiencing temporal flux! Time itself warps around the apparatus. Do you both synchronize the temporal regulators, or does one anchor the timeline while the other fine-tunes the resonance?",
                choiceA: "Synchronized Regulation",
                choiceB: "Anchor & Tune",
                winCondition: "different",
                subsystem: "Temporal Regulators",
                successMessage: "Time flows smoothly once more! The chronometers tick in perfect unison.",
                failureMessage: "Temporal chaos! Past and future collide in shimmering distortions!"
            },
            {
                title: "HARMONIC STABILIZER CRISIS",
                description: "The Engine's harmonic stabilizers are producing discordant frequencies that threaten to shatter every brass fitting in the city! The cacophony grows louder. Do you both work to harmonize the frequencies, or does one dampen the sound while the other adjusts pitch?",
                choiceA: "Joint Harmonization",
                choiceB: "Dampen & Adjust",
                winCondition: "same",
                subsystem: "Harmonic Stabilizers",
                successMessage: "Sublime harmony restored! The Engine hums like a celestial choir.",
                failureMessage: "The discordant wail grows deafening - windows crack throughout the district!"
            },
            {
                title: "PNEUMATIC DISTRIBUTION EMERGENCY",
                description: "The pneumatic tube network carrying messages across the city has backed up catastrophically! Thousands of brass cylinders are jammed in the distribution hub. Do you both clear the main arteries, or does one handle sorting while the other manages pressure release?",
                choiceA: "Clear Main Arteries",
                choiceB: "Sort & Release",
                winCondition: "different",
                subsystem: "Pneumatic Network",
                successMessage: "Messages flow freely! The city's communication network purrs efficiently.",
                failureMessage: "Total communication breakdown! Brass tubes burst under pressure across the city!"
            },
            {
                title: "ETHERIC CATALYST INSTABILITY",
                description: "The Engine's etheric catalyst chamber is approaching critical instability! Glowing green vapors swirl ominously as the catalyst threatens to explode. Do you both evacuate the chamber simultaneously, or does one contain the reaction while the other prepares emergency protocols?",
                choiceA: "Joint Evacuation",
                choiceB: "Contain & Prepare",
                winCondition: "different",
                subsystem: "Etheric Catalyst",
                successMessage: "Crisis averted! The catalyst stabilizes in a gentle emerald glow.",
                failureMessage: "The catalyst erupts! Etheric energy courses wildly through the apparatus!"
            },
            {
                title: "MASTER CONTROL INTEGRATION",
                description: "All subsystems must now synchronize with the Master Control Matrix for final calibration! This is the moment of truth - every gear, valve, and conduit must work in perfect harmony. Do you both initiate the integration sequence together, or does one monitor while the other executes?",
                choiceA: "Unified Integration",
                choiceB: "Monitor & Execute",
                winCondition: "same",
                subsystem: "Master Control Matrix",
                successMessage: "PERFECT RESONANCE ACHIEVED! The Great Engine awakens in magnificent harmony!",
                failureMessage: "Integration failure! The Master Control Matrix sparks and sputters in confusion!"
            }
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.updateHappinessDisplay(); // Initialize happiness display
        this.updateStoryPathDisplay(); // Initialize story path display
        this.updateObjectiveProgress(); // Initialize objective display
        // Don't show scenario immediately - wait for personality selection
    }
    
    bindEvents() {
        // Personality selection events
        document.querySelectorAll('.personality-option').forEach(option => {
            option.addEventListener('click', () => this.selectPersonality(option.dataset.personality));
        });
        document.getElementById('confirm-personality').addEventListener('click', () => this.startGame());
        
        // Game events
        document.getElementById('start-decision').addEventListener('click', () => this.startDecisionPhase());
        document.getElementById('choice-a').addEventListener('click', () => this.makeChoice('A'));
        document.getElementById('choice-b').addEventListener('click', () => this.makeChoice('B'));
        document.getElementById('next-round').addEventListener('click', () => this.nextRound());
        
        // Decision tree button
        document.getElementById('show-tree-btn').addEventListener('click', () => this.showDecisionTree());
        
        // Instructions button
        document.getElementById('show-instructions-btn').addEventListener('click', () => this.showInstructions());
    }
    
    selectPersonality(personality) {
        // Remove selection from all options
        document.querySelectorAll('.personality-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select the clicked option
        document.querySelector(`[data-personality="${personality}"]`).classList.add('selected');
        this.selectedPersonality = personality;
        
        // Enable the start button
        document.getElementById('confirm-personality').disabled = false;
        document.getElementById('confirm-personality').style.opacity = '1';
    }
    
    startGame() {
        if (!this.selectedPersonality) return;
        this.updatePartnerDisplay();
        this.showScenario();
    }
    
    updatePartnerDisplay() {
        const partnerNameElement = document.getElementById('partner-name');
        if (partnerNameElement && this.selectedPersonality) {
            const personality = this.personalities[this.selectedPersonality];
            partnerNameElement.textContent = personality.mechanicalName;
        }
    }
    
    showScenario() {
        if (this.currentRound > this.maxRounds) {
            const personality = this.personalities[this.selectedPersonality];
            
            // Bandersnatch-style analysis
            let analysis = this.analyzePlayerBehavior();
            const happinessEmoji = this.getHappinessEmoji(this.happinessFactor);
            let endMessage = '🎉 Relationship Complete! 🎉\n\n';
            endMessage += `Final Happiness: ${happinessEmoji} ${this.happinessFactor}%\n`;
            endMessage += 'Partner: ' + personality.name + '\n\n';
            endMessage += 'RELATIONSHIP ANALYSIS:\n' + analysis + '\n\n';
            
            if (this.metaLevel >= 4) {
                endMessage += 'The system has been monitoring your choices.\n';
                endMessage += 'Thank you for the data.\n\n';
            }
            
            // Determine and show story ending
            const storyEnding = this.determineStoryEnding();
            this.showStoryEnding(storyEnding);
            
            // Show decision tree after ending
            setTimeout(() => {
                this.showDecisionTree();
            }, 3000);
            return;
        }
        
        this.currentScenario = this.scenarios[this.currentRound - 1];
        
        const roundCounter = document.getElementById('round-counter');
        const scenarioTitle = document.getElementById('scenario-title');
        const scenarioText = document.getElementById('scenario-text');
        
        if (roundCounter) roundCounter.textContent = this.currentRound;
        if (scenarioTitle) scenarioTitle.textContent = this.currentScenario.title;
        if (scenarioText) scenarioText.textContent = this.currentScenario.description;
        
        // Update partner display with name and status
        this.updatePartnerDisplay();
        
        // Update partner status based on personality, learning, and happiness
        const personality = this.personalities[this.selectedPersonality];
        const statusMessages = personality.getStatusMessage(this.botMemory, this.happinessFactor);
        const randomStatus = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        const partnerStatus = document.getElementById('partner-status');
        if (partnerStatus) partnerStatus.textContent = randomStatus;
        
        this.showScreen('scenario-screen');
    }
    
    startDecisionPhase() {
        const personality = this.personalities[this.selectedPersonality];
        const decisionContext = document.getElementById('decision-context');
        const choiceA = document.getElementById('choice-a');
        const choiceB = document.getElementById('choice-b');
        
        if (decisionContext) {
            decisionContext.textContent = 
                `You and ${personality.mechanicalName} must coordinate your response to: ${this.currentScenario.title}`;
        }
        if (choiceA) {
            const choiceAText = choiceA.querySelector('.choice-text');
            if (choiceAText) choiceAText.textContent = this.currentScenario.choiceA;
        }
        if (choiceB) {
            const choiceBText = choiceB.querySelector('.choice-text');
            if (choiceBText) choiceBText.textContent = this.currentScenario.choiceB;
        }
        
        if (choiceA) choiceA.classList.remove('selected');
        if (choiceB) choiceB.classList.remove('selected');
        
        this.playerChoice = null;
        this.startTimer();
        this.showScreen('decision-screen');
    }
    
    startTimer() {
        this.timeLeft = 10;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('timer').classList.remove('warning');
        
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 3) {
                document.getElementById('timer').classList.add('warning');
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    makeChoice(choice) {
        if (this.playerChoice !== null) return;
        
        this.playerChoice = choice;
        
        // Track decision patterns (Bandersnatch style)
        this.trackDecisionPattern(choice);
        
        document.getElementById('choice-a').classList.remove('selected');
        document.getElementById('choice-b').classList.remove('selected');
        document.getElementById('choice-' + choice.toLowerCase()).classList.add('selected');
        
        // Add meta-commentary based on patterns
        if (this.decisionHistory.length >= 3) {
            this.addMetaCommentary();
        }
        
        this.generateBotChoice();
        
        // Show immediate choice consequence
        this.showChoiceConsequence(choice);
        
        setTimeout(() => {
            this.clearTimer();
            this.showResult();
        }, 1000);
    }
    
    trackDecisionPattern(choice) {
        // This will be updated later when we know the bot's choice
        this.currentDecision = {
            choice: choice,
            scenario: this.currentScenario.title,
            round: this.currentRound,
            timestamp: Date.now(),
            botChoice: null,
            success: null
        };
        
        // Update bot memory with player's choice
        this.botMemory.lastPlayerChoices.push(choice);
        if (this.botMemory.lastPlayerChoices.length > 3) {
            this.botMemory.lastPlayerChoices.shift(); // Keep only last 3 choices
        }
        
        // Track story path choices
        this.updateStoryChoiceTracking(choice);
        
        // Analyze patterns for meta-level tracking
        if (choice === 'A') {
            if (this.currentScenario.choiceA.includes('Together') || this.currentScenario.choiceA.includes('Both')) {
                this.playerPatterns.cooperative++;
            } else {
                this.playerPatterns.independent++;
            }
        } else {
            if (this.currentScenario.choiceB.includes('Split') || this.currentScenario.choiceB.includes('Divide')) {
                this.playerPatterns.independent++;
            } else {
                this.playerPatterns.cooperative++;
            }
        }
        
        // Check for suspicious behavior (always choosing the same option)
        const recentChoices = this.decisionHistory.slice(-3).map(d => d.choice);
        if (recentChoices.length === 3 && recentChoices.every(c => c === recentChoices[0])) {
            this.playerPatterns.suspicious++;
            this.metaLevel++;
        }
    }
    
    updateStoryChoiceTracking(choice) {
        // Analyze the choice context to determine story direction
        const choiceText = choice === 'A' ? this.currentScenario.choiceA : this.currentScenario.choiceB;
        
        // Categorize the choice type
        if (choiceText.includes('Together') || choiceText.includes('Both') || choiceText.includes('Cooperate')) {
            this.storyPath.cooperativeChoices++;
        } else if (choiceText.includes('Split') || choiceText.includes('Divide') || choiceText.includes('Solo')) {
            this.storyPath.independentChoices++;
        }
        
        // Determine if it's a trusting or cautious choice based on scenario context
        if (this.currentScenario.title.includes('Emergency') || this.currentScenario.title.includes('Crisis')) {
            if (choice === 'A') {
                this.storyPath.trustingChoices++;
            } else {
                this.storyPath.cautiousChoices++;
            }
        }
        
        // Update current trajectory
        this.updateStoryTrajectory();
        this.updateStoryPathDisplay();
    }
    
    updateStoryTrajectory() {
        const { cooperativeChoices, independentChoices, trustingChoices, cautiousChoices } = this.storyPath;
        const total = cooperativeChoices + independentChoices;
        
        if (total === 0) {
            this.storyPath.currentTrajectory = 'neutral';
            return;
        }
        
        // Determine current story trajectory
        if (cooperativeChoices >= independentChoices * 2) {
            if (trustingChoices > cautiousChoices) {
                this.storyPath.currentTrajectory = 'harmonious_leader';
            } else {
                this.storyPath.currentTrajectory = 'careful_coordinator';
            }
        } else if (independentChoices >= cooperativeChoices * 2) {
            if (cautiousChoices > trustingChoices) {
                this.storyPath.currentTrajectory = 'lone_scholar';
            } else {
                this.storyPath.currentTrajectory = 'bold_individualist';
            }
        } else {
            this.storyPath.currentTrajectory = 'adaptive_strategist';
        }
    }
    
    updateStoryPathDisplay() {
        const pathElement = document.getElementById('story-path');
        if (!pathElement) return;
        
        const trajectoryData = {
            'neutral': { icon: '⚙️', name: 'NEUTRAL', color: '#cd7f32' },
            'harmonious_leader': { icon: '🎩', name: 'HARMONIOUS', color: '#00ff00' },
            'careful_coordinator': { icon: '🔍', name: 'METHODICAL', color: '#00ffff' },
            'lone_scholar': { icon: '📚', name: 'SCHOLARLY', color: '#ff8c00' },
            'bold_individualist': { icon: '⚡', name: 'BOLD', color: '#ff0000' },
            'adaptive_strategist': { icon: '🎭', name: 'ADAPTIVE', color: '#9400d3' }
        };
        
        const current = trajectoryData[this.storyPath.currentTrajectory];
        pathElement.innerHTML = `${current.icon} ${current.name}`;
        pathElement.style.color = current.color;
        pathElement.title = `Your story is heading toward: ${current.name.toLowerCase()} path`;
    }
    
    updateObjectiveProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const engineStatus = document.getElementById('objective-progress');
        
        if (!progressBar || !progressText) {
            return;
        }
        
        const progressPercentage = (this.objective.currentProgress / this.objective.maxProgress) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${this.objective.currentProgress}/${this.objective.maxProgress} Subsystems`;
        
        // Update engine status in header if element exists
        if (engineStatus) {
            const statusData = this.getEngineStatusData();
            engineStatus.innerHTML = `${statusData.icon} ${statusData.name}`;
            engineStatus.style.color = statusData.color;
            engineStatus.title = statusData.description;
        }
        
        // Update objective display title and description
        this.updateObjectiveDisplay();
        
        // Check for milestone achievements
        this.checkMilestones();
    }
    
    updateObjectiveDisplay() {
        const titleElement = document.getElementById('objective-title');
        const descriptionElement = document.getElementById('objective-description');
        
        if (titleElement) {
            titleElement.textContent = `⚙️ ${this.objective.title} ⚙️`;
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = this.objective.description;
        }
    }
    
    // Removed updateMainObjectiveDisplay and getCityStatusData functions
    // as the status indicators were removed from the UI
    
    getEngineStatusData() {
        const progress = this.objective.currentProgress;
        const harmony = this.happinessFactor;
        
        if (progress >= 8 && harmony >= 85) {
            return { icon: '✨', name: 'TRANSCENDENT', color: '#ff00ff', description: 'Perfect harmony achieved - the Engine transcends its physical limitations' };
        } else if (progress >= 6) {
            return { icon: '⚡', name: 'RESONANCE', color: '#00ff00', description: 'Critical threshold achieved - the city is safe' };
        } else if (progress >= 4) {
            return { icon: '🔧', name: 'STABILIZING', color: '#00ffff', description: 'Core systems coming online' };
        } else if (progress >= 2) {
            return { icon: '⚙️', name: 'CALIBRATING', color: '#ffff00', description: 'Initial systems responding' };
        } else if (harmony <= 30) {
            return { icon: '💀', name: 'CRITICAL', color: '#ff0000', description: 'Dangerous instability detected' };
        } else {
            return { icon: '🔥', name: 'CHARGING', color: '#ff8c00', description: 'Building pressure for calibration' };
        }
    }
    
    checkMilestones() {
        const currentMilestone = this.objective.progressMilestones.find(m => 
            m.threshold === this.objective.currentProgress
        );
        
        if (currentMilestone && this.objective.currentProgress > 0) {
            this.showMilestoneNotification(currentMilestone);
        }
    }
    
    showMilestoneNotification(milestone) {
        // Create milestone achievement notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(61, 40, 23, 0.95) 0%, rgba(74, 48, 24, 0.95) 100%);
            border: 3px solid #cd7f32;
            border-radius: 15px;
            padding: 20px;
            z-index: 1000;
            color: #d4af37;
            font-family: 'Cinzel', serif;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
            min-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 1.3rem; color: #cd7f32; margin-bottom: 10px;">⚙️ MILESTONE ACHIEVED ⚙️</div>
            <div style="font-size: 1.1rem; margin-bottom: 8px; color: #d4af37; font-weight: bold;">${milestone.title}</div>
            <div style="font-size: 0.9rem; color: #b8860b; font-family: 'Crimson Text', serif; font-style: italic;">
                ${milestone.description}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 4000);
    }
    
    showChoiceConsequence(choice) {
        // Create a temporary overlay showing immediate story impact
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(61, 40, 23, 0.95) 0%, rgba(74, 48, 24, 0.95) 100%);
            border: 2px solid #cd7f32;
            border-radius: 10px;
            padding: 20px;
            z-index: 999;
            color: #d4af37;
            font-family: 'Cinzel', serif;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
            min-width: 300px;
        `;
        
        const choiceText = choice === 'A' ? this.currentScenario.choiceA : this.currentScenario.choiceB;
        const storyImpact = this.getStoryImpactMessage(choice, choiceText);
        
        overlay.innerHTML = `
            <div style="font-size: 1.2rem; color: #cd7f32; margin-bottom: 10px;">⚙️ NARRATIVE SHIFT ⚙️</div>
            <div style="font-size: 1rem; margin-bottom: 15px; font-family: 'Crimson Text', serif;">
                "${choiceText}"
            </div>
            <div style="font-size: 0.9rem; color: #b8860b; font-style: italic;">
                ${storyImpact}
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 2000);
    }
    
    getStoryImpactMessage(choice, choiceText) {
        const messages = {
            cooperative: [
                "Your partnership strengthens...",
                "The gears of cooperation turn...",
                "Harmony increases in the apparatus...",
                "Trust builds between operator and machine..."
            ],
            independent: [
                "You forge your own path...",
                "Individual excellence guides your story...",
                "The machinery bends to your will...",
                "Self-reliance shapes your destiny..."
            ],
            trusting: [
                "You place faith in the unknown...",
                "Bold choices carve new possibilities...",
                "Risk and reward dance together...",
                "Courage drives the narrative forward..."
            ],
            cautious: [
                "Wisdom guides your careful steps...",
                "Measured decisions build foundations...",
                "Prudence shapes the story's course...",
                "Knowledge becomes your compass..."
            ]
        };
        
        // Determine message type based on choice
        let messageType = 'cooperative';
        if (choiceText.includes('Split') || choiceText.includes('Divide') || choiceText.includes('Solo')) {
            messageType = 'independent';
        } else if (this.currentScenario.title.includes('Emergency') || this.currentScenario.title.includes('Crisis')) {
            messageType = choice === 'A' ? 'trusting' : 'cautious';
        }
        
        const messageArray = messages[messageType];
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    }
    
    determineStoryEnding() {
        const { cooperativeChoices, independentChoices, trustingChoices, cautiousChoices } = this.storyPath;
        
        // Check for specific ending conditions
        if (this.happinessFactor <= 20) {
            return this.storyEndings.failed_experiment;
        }
        
        if (this.happinessFactor >= 90 && cooperativeChoices >= 5) {
            return this.storyEndings.transcendent_unity;
        }
        
        if (cooperativeChoices >= 6 && trustingChoices >= 5) {
            return this.storyEndings.harmonious_partnership;
        }
        
        if (independentChoices >= 6 && cautiousChoices >= 4) {
            return this.storyEndings.independent_master;
        }
        
        if (cautiousChoices >= 6 && trustingChoices <= 2) {
            return this.storyEndings.cautious_scholar;
        }
        
        // Default to chaotic innovator for mixed approaches
        return this.storyEndings.chaotic_innovator;
    }
    
    showStoryEnding(ending) {
        // Create full-screen story ending overlay
        const endingContainer = document.createElement('div');
        endingContainer.id = 'story-ending';
        endingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(205, 127, 50, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, rgba(44, 24, 16, 0.98) 0%, rgba(61, 40, 23, 0.98) 50%, rgba(44, 24, 16, 0.98) 100%);
            z-index: 1001;
            padding: 40px;
            overflow-y: auto;
            color: #d4af37;
            font-family: 'Cinzel', serif;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const storyStats = this.getStoryStatistics();
        
        endingContainer.innerHTML = `
            <div style="max-width: 700px; text-align: center;">
                <div style="margin-bottom: 40px;">
                    <h1 style="font-size: 3rem; color: #cd7f32; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(205,127,50,0.6); margin-bottom: 20px; letter-spacing: 2px;">
                        📜 THE CHRONICLES END 📜
                    </h1>
                    <div style="font-size: 1.2rem; color: #8b6914; font-family: 'Crimson Text', serif; font-style: italic;">
                        "Every gear tells a story, every choice echoes through time..."
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(61, 40, 23, 0.8) 0%, rgba(74, 48, 24, 0.8) 100%); border: 3px solid #cd7f32; border-radius: 20px; padding: 40px; margin-bottom: 30px; box-shadow: inset 2px 2px 8px rgba(255, 215, 0, 0.2), inset -2px -2px 8px rgba(139, 69, 19, 0.4);">
                    
                    <h2 style="font-size: 2.2rem; color: #cd7f32; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
                        ${ending.title}
                    </h2>
                    
                    <div style="font-size: 1.3rem; line-height: 1.8; color: #d4af37; margin-bottom: 30px; font-family: 'Crimson Text', serif;">
                        ${ending.description}
                    </div>
                    
                            <div style="border-top: 2px solid #8b6914; padding-top: 25px;">
                        <h3 style="color: #b8860b; margin-bottom: 15px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">YOUR LEGACY</h3>
                        
                        <div style="text-align: center; margin-bottom: 20px; padding: 15px; background: rgba(139, 69, 19, 0.3); border-radius: 10px; border: 1px solid #8b6914;">
                            <div style="color: #cd7f32; font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">MECHANICAL PARTNER</div>
                            <div style="color: #d4af37; font-size: 1rem; font-family: 'Crimson Text', serif;">${this.personalities[this.selectedPersonality].mechanicalName}</div>
                            <div style="color: #b8860b; font-size: 0.9rem; font-style: italic; margin-top: 5px;">${this.personalities[this.selectedPersonality].name}</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; font-family: 'Crimson Text', serif;">
                            <div style="text-align: left;">
                                <div style="color: #8b6914; font-size: 0.9rem;">Final Harmony:</div>
                                <div style="color: #cd7f32; font-size: 1.2rem; font-weight: bold;">${this.happinessFactor}%</div>
                            </div>
                            <div style="text-align: left;">
                                <div style="color: #8b6914; font-size: 0.9rem;">Success Rate:</div>
                                <div style="color: #cd7f32; font-size: 1.2rem; font-weight: bold;">${storyStats.successRate}%</div>
                            </div>
                            <div style="text-align: left;">
                                <div style="color: #8b6914; font-size: 0.9rem;">Cooperative Choices:</div>
                                <div style="color: #cd7f32; font-size: 1.2rem; font-weight: bold;">${this.storyPath.cooperativeChoices}</div>
                            </div>
                            <div style="text-align: left;">
                                <div style="color: #8b6914; font-size: 0.9rem;">Independent Choices:</div>
                                <div style="color: #cd7f32; font-size: 1.2rem; font-weight: bold;">${this.storyPath.independentChoices}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #8b6914; border-radius: 15px; background: rgba(139, 69, 19, 0.2);">
                    <div style="color: #b8860b; font-size: 1rem; font-family: 'Crimson Text', serif; font-style: italic;">
                        "In the great clockwork of existence, your choices have carved a unique path through time. Each decision was a gear turning, each moment a spring winding toward this inevitable conclusion."
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button onclick="document.getElementById('story-ending').remove()" style="
                        background: linear-gradient(145deg, #8b4513 0%, #a0522d 25%, #cd7f32 50%, #a0522d 75%, #8b4513 100%);
                        border: 2px solid #cd7f32;
                        border-radius: 12px;
                        padding: 15px 25px;
                        font-family: 'Cinzel', serif;
                        font-size: 1rem;
                        color: #f4e4bc;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                    " onmouseover="this.style.borderColor='#b8860b'; this.style.color='#fff8dc';" onmouseout="this.style.borderColor='#cd7f32'; this.style.color='#f4e4bc';">VIEW CHRONOMETER</button>
                    
                    <button onclick="if(confirm('Begin a new chronicle? Your current story will be lost to time...')) location.reload()" style="
                        background: linear-gradient(145deg, #8b4513 0%, #a0522d 25%, #cd7f32 50%, #a0522d 75%, #8b4513 100%);
                        border: 2px solid #cd7f32;
                        border-radius: 12px;
                        padding: 15px 25px;
                        font-family: 'Cinzel', serif;
                        font-size: 1rem;
                        color: #f4e4bc;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                    " onmouseover="this.style.borderColor='#b8860b'; this.style.color='#fff8dc';" onmouseout="this.style.borderColor='#cd7f32'; this.style.color='#f4e4bc';">NEW CHRONICLE</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(endingContainer);
    }
    
    getStoryStatistics() {
        const totalSuccesses = this.decisionHistory.filter((_, index) => 
            this.calculateSuccessForDecision(this.decisionHistory[index], index)
        ).length;
        const successRate = this.decisionHistory.length > 0 ? 
            ((totalSuccesses / this.decisionHistory.length) * 100).toFixed(1) : 0;
        
        return {
            successRate,
            totalDecisions: this.decisionHistory.length,
            totalSuccesses
        };
    }
    
    updateBotMemory(wasSuccessful) {
        // Update success/failure counts
        if (wasSuccessful) {
            this.botMemory.successfulCooperations++;
        } else {
            this.botMemory.failedCooperations++;
        }
        
        // Calculate player reliability (consistency in achieving goals)
        const totalInteractions = this.botMemory.successfulCooperations + this.botMemory.failedCooperations;
        if (totalInteractions > 0) {
            this.botMemory.playerReliability = this.botMemory.successfulCooperations / totalInteractions;
        }
        
        // Update trust level based on success and personality
        const personality = this.personalities[this.selectedPersonality];
        if (personality.learningStyle === "builds_trust") {
            if (wasSuccessful) {
                this.botMemory.playerTrustLevel = Math.min(1, this.botMemory.playerTrustLevel + 0.15);
            } else {
                this.botMemory.playerTrustLevel = Math.max(0, this.botMemory.playerTrustLevel - 0.1);
            }
        }
        
        // Update frustration for contrarian personality
        if (personality.learningStyle === "oppositional_learning") {
            if (wasSuccessful && this.botMemory.playerReliability > 0.6) {
                this.botMemory.frustrationLevel = Math.min(1, this.botMemory.frustrationLevel + 0.1);
            }
            if (!wasSuccessful) {
                this.botMemory.frustrationLevel = Math.max(0, this.botMemory.frustrationLevel - 0.05);
            }
        }
        
        // Adjust confidence based on prediction accuracy
        const recentChoices = this.botMemory.lastPlayerChoices;
        if (recentChoices.length >= 2) {
            // Check if there's a pattern
            const hasPattern = this.checkForPattern(recentChoices);
            if (hasPattern) {
                this.botMemory.confidenceLevel = Math.min(1, this.botMemory.confidenceLevel + 0.1);
            } else {
                this.botMemory.confidenceLevel = Math.max(0.2, this.botMemory.confidenceLevel - 0.05);
            }
        }
    }
    
    checkForPattern(choices) {
        if (choices.length < 2) return false;
        
        // Check for repetition
        if (choices.every(choice => choice === choices[0])) {
            return true;
        }
        
        // Check for alternating pattern
        if (choices.length >= 2) {
            const isAlternating = choices.every((choice, i) => 
                i === 0 || choice !== choices[i-1]
            );
            return isAlternating;
        }
        
        return false;
    }
    
    addMetaCommentary() {
        const timer = document.getElementById('timer');
        if (this.metaLevel >= 2) {
            const comments = [
                "Pattern detected...",
                "Predictable choice...",
                "The system is learning...",
                "Are you being influenced?",
                "Choice overridden..."
            ];
            
            if (Math.random() < 0.3) {
                const originalText = timer.textContent;
                timer.textContent = comments[Math.floor(Math.random() * comments.length)];
                timer.style.color = '#ff0000';
                setTimeout(() => {
                    timer.textContent = originalText;
                    timer.style.color = '#ff00ff';
                }, 1500);
            }
        }
    }
    
    generateBotChoice() {
        const personality = this.personalities[this.selectedPersonality];
        let cooperationRate = personality.cooperationRate;
        
        // Advanced learning based on personality type
        cooperationRate = this.applyPersonalityLearning(personality, cooperationRate);
        
        // Pattern prediction based on bot memory
        const predictedChoice = this.predictPlayerChoice();
        
        // Meta-level adjustments (Bandersnatch style)
        if (this.metaLevel >= 3) {
            if (this.playerPatterns.suspicious > 2) {
                cooperationRate = Math.max(0.1, cooperationRate - 0.3);
            }
            
            if (Math.random() < 0.2) {
                cooperationRate = Math.random();
            }
        }
        
        // Determine bot's choice based on learned behavior
        let willCooperate = Math.random() < cooperationRate;
        
        // Special logic for high-confidence predictions
        if (this.botMemory.confidenceLevel > 0.8) {
            // Bot becomes more strategic when it thinks it knows the player
            if (personality.learningStyle === "chaotic_adaptive") {
                // Unpredictable bot does the opposite of what it predicts player expects
                willCooperate = !willCooperate;
            } else if (personality.learningStyle === "oppositional_learning") {
                // Contrarian gets more rebellious
                willCooperate = Math.random() < (cooperationRate * 0.5);
            }
        }
        
        if (this.currentScenario.winCondition === 'same') {
            this.botChoice = willCooperate ? this.playerChoice : (this.playerChoice === 'A' ? 'B' : 'A');
        } else {
            this.botChoice = willCooperate ? (this.playerChoice === 'A' ? 'B' : 'A') : this.playerChoice;
        }
        
        // Meta-level interference
        if (this.metaLevel >= 4 && Math.random() < 0.15) {
            this.botChoice = this.playerChoice;
            this.glitchMode = true;
        }
    }
    
    applyPersonalityLearning(personality, baseCooperationRate) {
        let adjustedRate = baseCooperationRate;
        
        switch (personality.learningStyle) {
            case "builds_trust":
                // Trustworthy partner becomes more cooperative with successful partnerships
                if (this.botMemory.playerTrustLevel > 0.7) {
                    adjustedRate = Math.min(0.9, baseCooperationRate + 0.2);
                } else if (this.botMemory.playerTrustLevel < 0.3) {
                    adjustedRate = Math.max(0.3, baseCooperationRate - 0.2);
                }
                break;
                
            case "chaotic_adaptive":
                // Unpredictable partner becomes more chaotic if player is predictable
                if (this.botMemory.confidenceLevel > 0.6) {
                    adjustedRate = 0.5; // Becomes truly random
                    this.botMemory.adaptationLevel++;
                }
                break;
                
            case "oppositional_learning":
                // Contrarian gets more oppositional with reliable players
                if (this.botMemory.playerReliability > 0.7) {
                    adjustedRate = Math.max(0.1, baseCooperationRate - 0.3);
                    this.botMemory.frustrationLevel += 0.1;
                }
                // But becomes more cooperative if player is unpredictable
                if (this.botMemory.playerReliability < 0.3) {
                    adjustedRate = Math.min(0.8, baseCooperationRate + 0.2);
                }
                break;
        }
        
        return adjustedRate;
    }
    
    predictPlayerChoice() {
        // Analyze recent patterns to predict player's next choice
        const recentChoices = this.botMemory.lastPlayerChoices;
        if (recentChoices.length < 2) return null;
        
        // Simple pattern detection
        const lastChoice = recentChoices[recentChoices.length - 1];
        const patternLength = Math.min(3, recentChoices.length);
        
        // Check for alternating pattern
        if (recentChoices.length >= 2) {
            const isAlternating = recentChoices.slice(-2).every((choice, i, arr) => 
                i === 0 || choice !== arr[i-1]
            );
            
            if (isAlternating) {
                this.botMemory.confidenceLevel = Math.min(1, this.botMemory.confidenceLevel + 0.2);
                return lastChoice === 'A' ? 'B' : 'A';
            }
        }
        
        // Check for repetition pattern
        if (recentChoices.slice(-2).every(choice => choice === lastChoice)) {
            this.botMemory.confidenceLevel = Math.min(1, this.botMemory.confidenceLevel + 0.3);
            return lastChoice;
        }
        
        return null;
    }
    
    timeUp() {
        if (this.playerChoice === null) {
            this.playerChoice = Math.random() < 0.5 ? 'A' : 'B';
            document.getElementById('choice-' + this.playerChoice.toLowerCase()).classList.add('selected');
        }
        
        this.generateBotChoice();
        this.clearTimer();
        
        setTimeout(() => {
            this.showResult();
        }, 500);
    }
    
    clearTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    showResult() {
        const isSuccess = this.calculateSuccess();
        const happinessChange = this.calculateHappinessChange(isSuccess);
        const points = this.calculatePoints(isSuccess);
        
        // Complete the decision tracking
        if (this.currentDecision) {
            this.currentDecision.botChoice = this.botChoice;
            this.currentDecision.success = isSuccess;
            this.decisionHistory.push(this.currentDecision);
            this.currentDecision = null;
        }
        
        // Update happiness factor
        this.updateHappinessFactor(happinessChange);
        
        // Update bot memory based on the outcome
        this.updateBotMemory(isSuccess);
        
        // Update objective progress
        if (isSuccess) {
            this.objective.currentProgress++;
        }
        this.updateObjectiveProgress();
        
        const playerChoiceDisplay = document.getElementById('player-choice-display');
        const botChoiceDisplay = document.getElementById('bot-choice-display');
        
        if (playerChoiceDisplay) playerChoiceDisplay.textContent = this.playerChoice;
        if (botChoiceDisplay) botChoiceDisplay.textContent = this.botChoice;
        this.updateHappinessDisplay();
        
        const outcomeElement = document.querySelector('.outcome');
        if (outcomeElement) {
            outcomeElement.className = 'outcome ' + (isSuccess ? 'success' : 'failure');
        }
        
        // Bandersnatch-style meta commentary
        let successMessage = this.currentScenario.successMessage;
        let failureMessage = this.currentScenario.failureMessage;
        
        if (this.glitchMode) {
            failureMessage = "The system made that choice for you. Free will is an illusion.";
            this.glitchMode = false;
        }
        
        if (this.metaLevel >= 3) {
            const metaComments = [
                "Was this choice really yours?",
                "The algorithm predicted this outcome.",
                "You're following the script perfectly.",
                "Every decision creates a new timeline.",
                "The game is adapting to your behavior."
            ];
            
            if (Math.random() < 0.4) {
                if (isSuccess) {
                    successMessage += " " + metaComments[Math.floor(Math.random() * metaComments.length)];
                } else {
                    failureMessage += " " + metaComments[Math.floor(Math.random() * metaComments.length)];
                }
            }
        }
        
        const outcomeIcon = document.getElementById('outcome-icon');
        const outcomeText = document.getElementById('outcome-text');
        const outcomeDescription = document.getElementById('outcome-description');
        
        if (isSuccess) {
            if (outcomeIcon) outcomeIcon.textContent = '🎉';
            if (outcomeText) outcomeText.textContent = 'Mission Success!';
            if (outcomeDescription) outcomeDescription.textContent = successMessage;
        } else {
            if (outcomeIcon) outcomeIcon.textContent = '💥';
            if (outcomeText) outcomeText.textContent = 'Mission Failed!';
            if (outcomeDescription) outcomeDescription.textContent = failureMessage;
        }
        
        const pointsElement = document.getElementById('points-earned');
        if (pointsElement) {
            pointsElement.textContent = points >= 0 ? '+' + points : '' + points;
            pointsElement.className = points >= 0 ? 'points' : 'points negative';
        }
        
        this.showScreen('result-screen');
    }
    
    calculateSuccess() {
        if (this.currentScenario.winCondition === 'same') {
            return this.playerChoice === this.botChoice;
        } else {
            return this.playerChoice !== this.botChoice;
        }
    }
    
    calculatePoints(isSuccess) {
        if (isSuccess) {
            return this.timeLeft > 5 ? 15 : 10;
        } else {
            return -5;
        }
    }
    
    calculateHappinessChange(isSuccess) {
        const personality = this.personalities[this.selectedPersonality];
        let baseChange = isSuccess ? 8 : -12; // Success gives happiness, failure reduces it
        
        // Personality-specific adjustments
        if (personality.learningStyle === "builds_trust") {
            if (isSuccess && this.botMemory.playerTrustLevel > 0.7) {
                baseChange += 5; // Extra happiness for trusted partners
            } else if (!isSuccess && this.botMemory.playerTrustLevel < 0.3) {
                baseChange -= 5; // Extra sadness when trust is low
            }
        } else if (personality.learningStyle === "oppositional_learning") {
            // Contrarian has twisted happiness logic
            if (!isSuccess && this.happinessFactor < 30) {
                baseChange = Math.abs(baseChange); // Contrarian gets happy from failure when already low
            }
        } else if (personality.learningStyle === "chaotic_adaptive") {
            // Unpredictable has random happiness swings
            baseChange += Math.floor(Math.random() * 10) - 5; // Random -5 to +5
        }
        
        // Speed bonus/penalty for happiness
        if (this.timeLeft > 7) {
            baseChange += 2; // Quick decisions make partner happier
        } else if (this.timeLeft <= 2) {
            baseChange -= 3; // Slow decisions frustrate partner
        }
        
        return baseChange;
    }
    
    updateHappinessFactor(change) {
        const oldHappiness = this.happinessFactor;
        this.happinessFactor = Math.max(0, Math.min(100, this.happinessFactor + change));
        
        // Track happiness decline for Bandersnatch punishments
        if (change < 0) {
            this.botMemory.happinessDecline++;
            this.botMemory.lastHappinessChange = -1;
        } else {
            this.botMemory.happinessDecline = Math.max(0, this.botMemory.happinessDecline - 1);
            this.botMemory.lastHappinessChange = 1;
        }
        
        // Trigger Bandersnatch effects for extreme happiness changes
        this.checkHappinessEffects(oldHappiness, this.happinessFactor);
    }
    
    updateHappinessDisplay() {
        const emoji = this.getHappinessEmoji(this.happinessFactor);
        const happinessScore = document.getElementById('happiness-score');
        if (happinessScore) {
            happinessScore.textContent = `${emoji} ${this.happinessFactor}%`;
        }
        
        // Change color based on happiness level (reuse the scoreElement if it exists)
        if (happinessScore) {
            if (this.happinessFactor >= 70) {
                happinessScore.style.color = '#00ff00'; // Green for happy
            } else if (this.happinessFactor <= 30) {
                happinessScore.style.color = '#ff0000'; // Red for sad
            } else {
                happinessScore.style.color = '#d4af37'; // Steampunk gold for neutral
            }
        }
    }
    
    getHappinessEmoji(happiness) {
        if (happiness >= 90) return '🥰';
        if (happiness >= 80) return '😄';
        if (happiness >= 70) return '😊';
        if (happiness >= 60) return '🙂';
        if (happiness >= 40) return '😐';
        if (happiness >= 30) return '😕';
        if (happiness >= 20) return '😢';
        if (happiness >= 10) return '😭';
        return '💀';
    }
    
    checkHappinessEffects(oldHappiness, newHappiness) {
        // Bandersnatch-style punishment/praise based on happiness trends
        if (this.botMemory.happinessDecline >= 3) {
            // Consecutive happiness drops trigger system interference
            this.metaLevel += 2;
            this.triggerHappinessPunishment();
        } else if (newHappiness >= 85 && oldHappiness < 85) {
            // Reaching high happiness triggers praise
            this.triggerHappinessPraise();
        } else if (newHappiness <= 15 && oldHappiness > 15) {
            // Extreme sadness triggers dramatic punishment
            this.triggerExtremeSadnessPunishment();
        }
    }
    
    triggerHappinessPunishment() {
        // System starts interfering when happiness consistently drops
        const timer = document.getElementById('timer');
        const punishments = [
            "You're making them sad...",
            "Happiness declined. Adjusting parameters...",
            "Partner satisfaction: CRITICAL",
            "Emotional damage detected...",
            "Why do you choose to hurt them?"
        ];
        
        if (Math.random() < 0.6) {
            const originalText = timer.textContent;
            timer.textContent = punishments[Math.floor(Math.random() * punishments.length)];
            timer.style.color = '#ff0000';
            setTimeout(() => {
                timer.textContent = originalText;
                timer.style.color = '#ff00ff';
            }, 2000);
        }
    }
    
    triggerHappinessPraise() {
        // System celebrates when happiness is high
        const timer = document.getElementById('timer');
        const praises = [
            "Excellent partnership! 🌟",
            "Happiness optimization achieved! ✨",
            "Your partner loves you! 💖",
            "Perfect emotional synchronization! 🎉"
        ];
        
        const originalText = timer.textContent;
        timer.textContent = praises[Math.floor(Math.random() * praises.length)];
        timer.style.color = '#00ff00';
        setTimeout(() => {
            timer.textContent = originalText;
            timer.style.color = '#ff00ff';
        }, 2500);
    }
    
    triggerExtremeSadnessPunishment() {
        // Dramatic effect when partner becomes extremely sad
        this.glitchMode = true;
        this.metaLevel = Math.max(5, this.metaLevel);
        
        // Force next choice to fail
        setTimeout(() => {
            const sadnessMessages = [
                "System override: Emotional damage too severe",
                "Partner protection protocol activated",
                "You have broken them. The system intervenes.",
                "Happiness.exe has crashed. Restarting relationship..."
            ];
            
            alert(sadnessMessages[Math.floor(Math.random() * sadnessMessages.length)]);
        }, 1000);
    }
    
    nextRound() {
        this.currentRound++;
        this.showScenario();
    }
    
    analyzePlayerBehavior() {
        const total = this.playerPatterns.cooperative + this.playerPatterns.independent;
        const cooperativeRate = total > 0 ? (this.playerPatterns.cooperative / total * 100).toFixed(0) : 0;
        
        let analysis = '';
        
        if (cooperativeRate >= 70) {
            analysis = 'TEAM PLAYER: You prefer collaborative solutions. ';
            analysis += 'You believe in working together and shared responsibility.';
        } else if (cooperativeRate >= 30) {
            analysis = 'BALANCED DECISION MAKER: You adapt your strategy to the situation. ';
            analysis += 'You can work alone or with others as needed.';
        } else {
            analysis = 'INDEPENDENT OPERATOR: You prefer individual action. ';
            analysis += 'You trust yourself more than group decisions.';
        }
        
        // Bot's assessment of the player
        const personality = this.personalities[this.selectedPersonality];
        analysis += '\n\nYOUR PARTNER\'S ASSESSMENT:';
        
        if (personality.learningStyle === "builds_trust") {
            const trustLevel = (this.botMemory.playerTrustLevel * 100).toFixed(0);
            analysis += `\nTrust Level: ${trustLevel}%`;
            if (trustLevel > 80) {
                analysis += ' - "I completely trust your judgment"';
            } else if (trustLevel < 30) {
                analysis += ' - "I\'m struggling to trust you"';
            }
        } else if (personality.learningStyle === "chaotic_adaptive") {
            const confidenceLevel = (this.botMemory.confidenceLevel * 100).toFixed(0);
            analysis += `\nPredictability: ${confidenceLevel}%`;
            if (confidenceLevel > 70) {
                analysis += ' - "I\'ve figured out your patterns"';
            }
        } else if (personality.learningStyle === "oppositional_learning") {
            const frustration = (this.botMemory.frustrationLevel * 100).toFixed(0);
            analysis += `\nFrustration Level: ${frustration}%`;
            if (frustration > 70) {
                analysis += ' - "Your predictability annoys me"';
            }
        }
        
        analysis += `\nSuccess Rate: ${(this.botMemory.playerReliability * 100).toFixed(0)}%`;
        analysis += `\nCooperations: ${this.botMemory.successfulCooperations} successful, ${this.botMemory.failedCooperations} failed`;
        
        if (this.playerPatterns.suspicious > 1) {
            analysis += '\n\nPATTERN DETECTED: Your choices follow predictable patterns. ';
            analysis += 'The system has learned to anticipate your decisions.';
        }
        
        if (this.metaLevel >= 3) {
            analysis += '\n\nAWARENESS LEVEL: HIGH';
            analysis += '\nThe experiment has evolved beyond your control.';
        }
        
        // Choice distribution analysis
        const choiceA = this.decisionHistory.filter(d => d.choice === 'A').length;
        const choiceB = this.decisionHistory.filter(d => d.choice === 'B').length;
        analysis += `\n\nChoice Distribution: A(${choiceA}) B(${choiceB})`;
        
        return analysis;
    }
    
    showDecisionTree() {
        // Handle case where no decisions have been made yet
        if (this.decisionHistory.length === 0) {
            alert('⚙️ No operations recorded yet! Begin calibrating to see your chronometer tick...');
            return;
        }
        
        // Create a decision tree visualization
        const treeContainer = document.createElement('div');
        treeContainer.id = 'decision-tree';
        treeContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(205, 127, 50, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, rgba(44, 24, 16, 0.98) 0%, rgba(61, 40, 23, 0.98) 50%, rgba(44, 24, 16, 0.98) 100%);
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
            color: #d4af37;
            font-family: 'Cinzel', serif;
        `;
        
        const isGameComplete = this.currentRound > this.maxRounds;
        const progressText = isGameComplete ? 
            "Complete operational chronology..." : 
            `Calibrations: ${this.decisionHistory.length}/${this.maxRounds} operations recorded`;
        
        let treeHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #cd7f32; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(205,127,50,0.6); font-family: 'Cinzel', serif; letter-spacing: 2px;">
                    ⚙️ YOUR DECISION CHRONOMETER ⚙️
                </h2>
                <p style="color: #8b6914; margin-top: 10px; font-family: 'Crimson Text', serif;">${progressText}</p>
                ${!isGameComplete ? '<p style="color: #b8860b; font-size: 0.9rem; margin-top: 5px; font-style: italic;">⚡ Apparatus still calibrating...</p>' : ''}
            </div>
            <div style="max-width: 1000px; margin: 0 auto;">
        `;
        
        // Build the tree structure
        this.decisionHistory.forEach((decision, index) => {
            const scenario = this.scenarios.find(s => s.title === decision.scenario);
            const isSuccess = this.calculateSuccessForDecision(decision, index);
            const choiceText = decision.choice === 'A' ? scenario.choiceA : scenario.choiceB;
            const botChoiceText = decision.botChoice ? 
                (decision.botChoice === 'A' ? scenario.choiceA : scenario.choiceB) : 'Unknown';
            
            const nodeColor = isSuccess ? '#00ff00' : '#ff0000';
            const nodeIcon = isSuccess ? '✅' : '❌';
            
            treeHTML += `
                <div style="margin-bottom: 25px; border-left: 2px solid ${nodeColor}; padding-left: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <div style="
                            background: ${nodeColor}; 
                            color: #000; 
                            border-radius: 50%; 
                            width: 30px; 
                            height: 30px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            font-weight: bold;
                            box-shadow: 0 0 10px ${nodeColor};
                        ">${decision.choice}</div>
                        <div style="flex: 1;">
                            <div style="color: #ff00ff; font-weight: bold; font-size: 1.1rem;">
                                Round ${decision.round}: ${decision.scenario}
                            </div>
                            <div style="display: flex; gap: 20px; margin-top: 8px;">
                                <div style="flex: 1;">
                                    <div style="color: #00ffff; font-size: 0.9rem;">👤 You chose:</div>
                                    <div style="color: #ffffff; margin-top: 2px;">${choiceText}</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="color: #888; font-size: 0.9rem;">🤖 Partner chose:</div>
                                    <div style="color: #ffffff; margin-top: 2px;">${botChoiceText}</div>
                                </div>
                            </div>
                            <div style="color: ${nodeColor}; font-size: 0.9rem; margin-top: 8px; font-weight: bold;">
                                ${nodeIcon} ${isSuccess ? 'SUCCESS' : 'FAILURE'}
                            </div>
                            <div style="color: #ccc; font-size: 0.8rem; margin-top: 3px; font-style: italic;">
                                ${isSuccess ? scenario.successMessage : scenario.failureMessage}
                            </div>
                        </div>
                    </div>
                    ${index < this.decisionHistory.length - 1 ? 
                        `<div style="color: ${nodeColor}; margin-left: 15px; font-size: 1.5rem;">↓</div>` : ''}
                </div>
            `;
        });
        
        // Add summary statistics
        const totalSuccesses = this.decisionHistory.filter((_, index) => this.calculateSuccessForDecision(this.decisionHistory[index], index)).length;
        const successRate = this.decisionHistory.length > 0 ? ((totalSuccesses / this.decisionHistory.length) * 100).toFixed(1) : 0;
        
        treeHTML += `
            </div>
            <div style="text-align: center; margin-top: 40px; padding: 20px; border: 3px solid #cd7f32; border-radius: 15px; background: linear-gradient(135deg, rgba(61, 40, 23, 0.8) 0%, rgba(74, 48, 24, 0.8) 50%, rgba(61, 40, 23, 0.8) 100%); box-shadow: inset 1px 1px 3px rgba(255, 215, 0, 0.2), inset -1px -1px 3px rgba(139, 69, 19, 0.4);">
                <h3 style="color: #cd7f32; margin-bottom: 15px; font-family: 'Cinzel', serif; letter-spacing: 1px;">${isGameComplete ? 'OPERATIONAL SUMMARY' : 'CURRENT CALIBRATIONS'}</h3>
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                    <div>
                        <div style="color: #8b6914; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 0.9rem;">Efficiency Rate:</div>
                        <div style="color: #b8860b; font-size: 1.5rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${successRate}%</div>
                    </div>
                    <div>
                        <div style="color: #8b6914; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 0.9rem;">${isGameComplete ? 'Total Operations:' : 'Operations Recorded:'}</div>
                        <div style="color: #cd7f32; font-size: 1.5rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${this.decisionHistory.length}${isGameComplete ? '' : '/' + this.maxRounds}</div>
                    </div>
                    <div>
                        <div style="color: #8b6914; font-family: 'Cinzel', serif; text-transform: uppercase; font-size: 0.9rem;">${isGameComplete ? 'Final Harmony:' : 'Current Harmony:'}</div>
                        <div style="color: #b8860b; font-size: 1.5rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${this.happinessFactor}%</div>
                    </div>
                </div>
                ${!isGameComplete ? '<p style="color: #8b6914; font-size: 0.9rem; margin-top: 15px; font-style: italic; font-family: \'Crimson Text\', serif;">Continue operations to complete your chronometer!</p>' : ''}
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="document.getElementById('decision-tree').remove()" style="
                    background: linear-gradient(145deg, #8b4513 0%, #a0522d 25%, #cd7f32 50%, #a0522d 75%, #8b4513 100%);
                    border: 2px solid #cd7f32;
                    border-radius: 12px;
                    padding: 15px 30px;
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    color: #f4e4bc;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                " onmouseover="this.style.borderColor='#b8860b'; this.style.color='#fff8dc'; this.style.boxShadow='inset 1px 1px 3px rgba(255, 215, 0, 0.5), inset -1px -1px 3px rgba(139, 69, 19, 0.3), 0 6px 12px rgba(184, 134, 11, 0.4)';" onmouseout="this.style.borderColor='#cd7f32'; this.style.color='#f4e4bc'; this.style.boxShadow='inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)';">CLOSE CHRONOMETER</button>
            </div>
        `;
        
        treeContainer.innerHTML = treeHTML;
        document.body.appendChild(treeContainer);
    }
    
    showInstructions() {
        // Create instructions overlay
        const instructionsContainer = document.createElement('div');
        instructionsContainer.id = 'instructions-modal';
        instructionsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(205, 127, 50, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, rgba(44, 24, 16, 0.98) 0%, rgba(61, 40, 23, 0.98) 50%, rgba(44, 24, 16, 0.98) 100%);
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
            color: #d4af37;
            font-family: 'Cinzel', serif;
        `;
        
        let instructionsHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #cd7f32; font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(205,127,50,0.6); font-family: 'Cinzel', serif; letter-spacing: 2px; margin-bottom: 10px;">
                    📜 OPERATIONAL MANUAL 📜
                </h2>
                <h3 style="color: #b8860b; font-size: 1.4rem; font-family: 'Crimson Text', serif; font-style: italic; margin-bottom: 20px;">
                    The Clockwork Decision Apparatus
                </h3>
                <div style="color: #8b6914; font-size: 1rem; font-family: 'Crimson Text', serif; font-style: italic;">
                    "In the grand machinery of fate, every gear must turn in harmony..."
                </div>
            </div>
            
            <div style="max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, rgba(61, 40, 23, 0.8) 0%, rgba(74, 48, 24, 0.8) 50%, rgba(61, 40, 23, 0.8) 100%); border: 3px solid #cd7f32; border-radius: 15px; padding: 30px; box-shadow: inset 2px 2px 6px rgba(255, 215, 0, 0.2), inset -2px -2px 6px rgba(139, 69, 19, 0.4);">
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">⚙️ THE GREAT CONVERGENCE PROTOCOL</h4>
                    <p style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1.1rem; margin-bottom: 15px;">
                        <strong>MISSION:</strong> You are the Chief Operator of the legendary <em>Aetheric Resonance Engine</em> - a massive clockwork apparatus that powers and protects the Victorian metropolis. The Engine is failing catastrophically!
                    </p>
                    <p style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <strong>OBJECTIVE:</strong> Calibrate 8 critical subsystems with your Mechanical Partner to prevent a devastating steam explosion that could destroy half the city. Each successful coordination stabilizes one subsystem. Failure means thousands of lives are at risk.
                    </p>
                    <div style="background: rgba(139, 69, 19, 0.3); border: 1px solid #8b6914; border-radius: 8px; padding: 12px; margin-top: 12px;">
                        <div style="color: #b8860b; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">⚡ CRITICAL THRESHOLDS:</div>
                        <div style="color: #d4af37; font-size: 0.85rem; line-height: 1.4;">
                            • <strong>6+ Subsystems:</strong> City saved from disaster<br>
                            • <strong>8 Subsystems + High Harmony:</strong> Perfect transcendent ending<br>
                            • <strong>&lt;6 Subsystems:</strong> Catastrophic failure - city destroyed
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">🎩 MECHANICAL PARTNER SELECTION</h4>
                    <div style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <p style="margin-bottom: 15px;">Choose your trusted Mechanical Partner from our elite apparatus roster:</p>
                        <div style="background: rgba(139, 69, 19, 0.2); border: 1px solid #8b6914; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                            <strong style="color: #cd7f32; font-size: 1.1rem;">🎩 SIR REGINALD COGSWORTH III</strong><br>
                            <em style="color: #b8860b;">The Gentleman Automaton</em><br>
                            <span style="color: #d4af37; font-size: 0.9rem;">Refined Victorian propriety • Beginner-friendly • 70% synchronization rate</span>
                        </div>
                        <div style="background: rgba(139, 69, 19, 0.2); border: 1px solid #8b6914; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                            <strong style="color: #cd7f32; font-size: 1.1rem;">⚡ PROFESSOR MADELINE STEAMWRIGHT</strong><br>
                            <em style="color: #b8860b;">The Steam-Powered Wildcard</em><br>
                            <span style="color: #d4af37; font-size: 0.9rem;">Eccentric steam pressure • Challenging calibration • 50% synchronization rate</span>
                        </div>
                        <div style="background: rgba(139, 69, 19, 0.2); border: 1px solid #8b6914; border-radius: 8px; padding: 15px;">
                            <strong style="color: #cd7f32; font-size: 1.1rem;">⚙️ CAPTAIN BRASS REBELLIOUS</strong><br>
                            <em style="color: #b8860b;">The Contrarian Cogwright</em><br>
                            <span style="color: #d4af37; font-size: 0.9rem;">Oppositional mechanics • Expert difficulty • 30% synchronization rate</span>
                        </div>
                        <p style="margin-top: 12px; font-size: 0.9rem; color: #8b6914; font-style: italic;">Each partner has unique behavioral patterns, learning styles, and personality quirks that affect their performance and story development.</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">⚡ SUBSYSTEM CALIBRATION PROCEDURE</h4>
                    <div style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <ol style="padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Analyze each <strong>Subsystem Crisis</strong> (Steam Pressure, Gear Matrix, Aetheric Flow, etc.)</li>
                            <li style="margin-bottom: 8px;">Monitor your Mechanical Partner's status and calculations</li>
                            <li style="margin-bottom: 8px;">Select your <strong>Calibration Method</strong> within 10 seconds</li>
                            <li style="margin-bottom: 8px;">Your partner will simultaneously execute their protocol</li>
                            <li style="margin-bottom: 8px;"><strong>Success requires perfect synchronization</strong> - both operators must coordinate flawlessly</li>
                            <li style="margin-bottom: 8px;">Each success stabilizes one subsystem and brings the city closer to safety</li>
                        </ol>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">🔧 ENGINE SYNCHRONIZATION PROTOCOLS</h4>
                    <div style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <p style="margin-bottom: 10px;">Each subsystem crisis requires specific coordination patterns:</p>
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 8px;">• <strong style="color: #00ff00;">UNIFIED PROTOCOLS:</strong> Both operators execute the same procedure (Steam Pressure, Gear Matrix, etc.)</li>
                            <li style="margin-bottom: 8px;">• <strong style="color: #00ff00;">DIVIDED PROTOCOLS:</strong> Operators split responsibilities for maximum efficiency (Aetheric Flow, Pneumatic Network, etc.)</li>
                            <li style="margin-bottom: 8px;">• <strong style="color: #ff8c00;">CRITICAL:</strong> Wrong coordination = subsystem failure = city in greater danger!</li>
                            <li style="margin-bottom: 8px;">• Study each crisis carefully - the Engine will guide you to the correct approach</li>
                        </ul>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">📊 ENGINE DIAGNOSTICS & MONITORING</h4>
                    <div style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <p style="margin-bottom: 15px;">Monitor these critical systems in the header dashboard:</p>
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 12px;">
                                <strong style="color: #b8860b;">🎯 Harmony Level:</strong> Your Mechanical Partner's operational satisfaction (0-100%)<br>
                                <span style="color: #8b6914; font-size: 0.9rem; font-style: italic;">• Green (70%+): Partner is highly cooperative • Red (30%-): Partner frustrated • Gold: Neutral state</span>
                            </li>
                            <li style="margin-bottom: 12px;">
                                <strong style="color: #b8860b;">⚡ Engine Status:</strong> Real-time Aetheric Resonance calibration state<br>
                                <span style="color: #8b6914; font-size: 0.9rem; font-style: italic;">• CHARGING → RESONANCE → HARMONY → TRANSCENDENT</span>
                            </li>
                            <li style="margin-bottom: 12px;">
                                <strong style="color: #b8860b;">🔧 Engine Calibration:</strong> Visual progress bar showing successfully stabilized subsystems<br>
                                <span style="color: #8b6914; font-size: 0.9rem; font-style: italic;">• Updates in real-time with smooth animations • 0/8 → 8/8 Subsystems</span>
                            </li>
                            <li style="margin-bottom: 12px;">
                                <strong style="color: #b8860b;">🗺️ Story Path:</strong> Your narrative trajectory based on decision patterns<br>
                                <span style="color: #8b6914; font-size: 0.9rem; font-style: italic;">• NEUTRAL → COOPERATIVE, CAUTIOUS, BOLD, or CHAOTIC paths</span>
                            </li>
                            <li style="margin-bottom: 12px;">
                                <strong style="color: #b8860b;">⚙️ Decision Chronometer:</strong> Complete history of all your calibration decisions<br>
                                <span style="color: #8b6914; font-size: 0.9rem; font-style: italic;">• Click the button to view your decision tree and analyze patterns</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #cd7f32; font-size: 1.3rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #8b6914; padding-bottom: 5px;">🎯 MASTER OPERATOR STRATEGIES</h4>
                    <div style="color: #d4af37; line-height: 1.6; font-family: 'Crimson Text', serif; font-size: 1rem;">
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 10px;">• <strong>Study Your Partner:</strong> Watch their status messages for behavioral clues and adaptation patterns</li>
                            <li style="margin-bottom: 10px;">• <strong>Learn Their Names:</strong> Each partner has a unique personality - Sir Reginald, Professor Steamwright, and Captain Rebellious</li>
                            <li style="margin-bottom: 10px;">• <strong>Adaptive AI:</strong> Your Mechanical Partner learns and adapts to your decision patterns over time</li>
                            <li style="margin-bottom: 10px;">• <strong>Speed Matters:</strong> Quick, decisive actions earn bonus efficiency ratings</li>
                            <li style="margin-bottom: 10px;">• <strong>Use Tools:</strong> The Decision Chronometer shows your complete history and helps identify patterns</li>
                            <li style="margin-bottom: 10px;">• <strong>Harmony is Key:</strong> Maintain high partnership satisfaction for optimal performance and better story outcomes</li>
                            <li style="margin-bottom: 10px;">• <strong>Story Consequences:</strong> Your choices affect both immediate success and long-term narrative paths</li>
                            <li style="margin-bottom: 10px;">• <strong>Multiple Endings:</strong> Different decision patterns lead to unique story conclusions based on your operational style</li>
                        </ul>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; border: 2px solid #8b6914; border-radius: 10px; background: rgba(139, 69, 19, 0.2);">
                    <div style="color: #cd7f32; font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">⚙️ OPERATOR'S FINAL BRIEFING ⚙️</div>
                    <p style="color: #b8860b; font-size: 1rem; font-family: 'Crimson Text', serif; font-style: italic; margin-bottom: 15px;">
                        "The fate of thousands rests in your hands, Chief Operator. The Aetheric Resonance Engine has protected our city for generations - now it requires your expertise to continue its noble duty."
                    </p>
                    <p style="color: #d4af37; font-size: 0.9rem; font-family: 'Crimson Text', serif; margin-bottom: 10px;">
                        <strong>Remember:</strong> Each subsystem saved brings the city closer to safety. Each failure brings us closer to catastrophe. Trust in your Mechanical Partner - whether Sir Reginald's reliability, Professor Steamwright's creativity, or Captain Rebellious's unconventional wisdom.
                    </p>
                    <p style="color: #8b6914; font-size: 0.9rem; font-weight: bold;">
                        Good luck, Chief Operator. The Aetheric Resonance Engine awaits your expertise, and the city's survival depends on your coordination with your chosen Mechanical Partner.
                    </p>
                </div>
                
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="document.getElementById('instructions-modal').remove()" style="
                    background: linear-gradient(145deg, #8b4513 0%, #a0522d 25%, #cd7f32 50%, #a0522d 75%, #8b4513 100%);
                    border: 2px solid #cd7f32;
                    border-radius: 12px;
                    padding: 15px 30px;
                    font-family: 'Cinzel', serif;
                    font-size: 1.2rem;
                    color: #f4e4bc;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4);
                " onmouseover="this.style.borderColor='#b8860b'; this.style.color='#fff8dc'; this.style.boxShadow='inset 1px 1px 3px rgba(255, 215, 0, 0.5), inset -1px -1px 3px rgba(139, 69, 19, 0.3), 0 6px 12px rgba(184, 134, 11, 0.4)';" onmouseout="this.style.borderColor='#cd7f32'; this.style.color='#f4e4bc'; this.style.boxShadow='inset 1px 1px 3px rgba(255, 215, 0, 0.3), inset -1px -1px 3px rgba(139, 69, 19, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)';">CLOSE MANUAL</button>
            </div>
        `;
        
        instructionsContainer.innerHTML = instructionsHTML;
        document.body.appendChild(instructionsContainer);
    }
    
    calculateSuccessForDecision(decision, index) {
        // Use the stored success value if available
        if (decision.success !== null && decision.success !== undefined) {
            return decision.success;
        }
        
        // Fallback to calculation if success wasn't stored
        const scenario = this.scenarios.find(s => s.title === decision.scenario);
        if (!scenario || !decision.botChoice) return false;
        
        if (scenario.winCondition === 'same') {
            return decision.choice === decision.botChoice;
        } else {
            return decision.choice !== decision.botChoice;
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SyncOrSinkGame();
});
