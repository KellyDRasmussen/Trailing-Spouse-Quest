// ========================
// TIME MANAGEMENT SYSTEM
// ========================

// Time tracking function - core of the time management system
setup.useTime = function(id, time) {
  const v = State.variables;
  v.timeLog = v.timeLog || {};
  v.provisionalTime = v.provisionalTime || 0;
  v.timeBucket = v.timeBucket || 0;

  // If this activity already has time assigned, remove it first
  if (v.timeLog[id]) {
    v.provisionalTime -= v.timeLog[id];
    v.timeBucket -= v.timeLog[id];
  }

  // Add the new time
  v.timeLog[id] = time;
  v.provisionalTime += time;
  v.timeBucket += time;
  
  // Check if we need to advance the month
  if (v.timeBucket >= 1.0) {
    v.advance = true;
  }
  
  console.log(`Time used: ${id}, ${time}, total: ${v.timeBucket}`);
  return v.timeBucket;
};

// Reset Month Helper
setup.resetMonth = function () {
  const v = State.variables;
  v.month = (v.month || 1) + 1;
  v.timeBucket = 0;
  v.provisionalTime = 0;
  v.advance = false;
  v.bujoPlans = [];
  v.bujoOpportunities = [];
  v.kidsPickedUp = false;
  v.changedmind = false;
  v.application_state = "";
  v.newMonthStarted = true;
  v.timeLog = {};
  
  console.log("Month reset to: " + v.month);
};

// ========================
// OPPORTUNITY MANAGEMENT
// ========================

// Fixed Commit Plan function
setup.commitPlan = function(opp) {
  const v = State.variables;
  
  // Initialize variables if they don't exist
  v.bujoPlans = v.bujoPlans || [];
  v.timeBucket = v.timeBucket || 0;
  v.provisionalTime = v.provisionalTime || 0;
  
  // Check if already planned
  const alreadyPlanned = v.bujoPlans.some(p => p.id === opp.id);
  
  // Check if there's enough time
  const hasEnoughTime = v.timeBucket + opp.timeCost <= 1.0;
  
  // Debug output
  console.log(`commitPlan: ${opp.id}, already planned: ${alreadyPlanned}, enough time: ${hasEnoughTime}, current time: ${v.timeBucket}`);
  
  // Only proceed if not already planned and there's enough time
  if (!alreadyPlanned && hasEnoughTime) {
    // Add the plan
    v.bujoPlans.push(opp);
    
    // Use the time
    setup.useTime(opp.id, opp.timeCost);
    
    // Check if month is full
    if (v.timeBucket >= 1.0) {
      v.advance = true;
    }
    
    // Return to BuJo
    Engine.play("BuJo_Regular");
    return true;
  }
  
  return false;
};

// Helper to add opportunity IDs to BuJo invites
setup.addOpportunity = function(id) {
  const opp = State.variables.allOpportunities.find(o => o.id === id);
  if (!opp) return;

  if (!State.variables.bujoOpportunities) {
    State.variables.bujoOpportunities = [];
  }

  const alreadyExists = State.variables.bujoOpportunities.some(p => p.id === opp.id);
  if (!alreadyExists) {
    State.variables.bujoOpportunities.push(opp);
  }
};

// ========================
// JOB HUNTING SYSTEM
// ========================

// Job Hunt Selection function
setup.jobhuntSelect = function(id, time, luck, text) {
  const v = State.variables;
  
  // Initialize if not already
  v.provisionalTime = v.provisionalTime || 0;
  v.timeBucket = v.timeBucket || 0;
  v.timeLog = v.timeLog || {};
  v.luck = v.luck || 0;
  
  // Track changed mind
  const prev = v.application_state;
  if (prev !== "" && prev !== id) {
      v.changedmind = true;
  }

  // Apply luck if appropriate
  if (!v.changedmind && luck > 0) {
      v.luck += luck;
  }

  // Set state
  v.application_state = id;
  v.activities = true;
  v.selectedJobTime = time;
  v.jobMessage = text;

  // Use time (this will handle removing previous time and adding new time)
  setup.useTime("jobhunt", time);
  
  // Log for debugging
  console.log(`Job hunt selection: ${id}, time: ${time}, luck: ${luck}, total time: ${v.timeBucket}`);
};

// Get BuJo intro text based on job hunting selection
setup.getBujoIntro = function(state, changedmind) {
  if (changedmind) {
    return "You have erased some plans carefully. Only a forensics expert could see your previous spread.";
  }

  switch (state) {
    case "ft":
      return "Your BuJo is jacked to the brim with goals and targets. GET A JOB you have underlined five times.";
    case "pt":
      return "You've drawn out a little calendar spread to track your applications.";
    case "vpt":
      return 'You have written "Apply for a job every week" and drawn a picture of you typing on a laptop giving a thumbs up.';
    case "nope":
      return 'You have written Goals: Survive and drawn a little doodle of Katniss Everdeen 🏹';
    case "":
    default:
      return "A brand new Bullet Journal. So much potential in these pages!";
  }
};

// ========================
// MESSAGE SYSTEM
// ========================

// Group Chat Message Macro
Macro.add('addGroupMessage', {
  handler: function () {
    if (this.args.length < 2) {
      return this.error("Expected: sender, content [optional: timestamp]");
    }
    const sender = this.args[0];
    const content = this.args[1];

    if (!Array.isArray(State.variables.groupMessages)) {
      State.variables.groupMessages = [];
    }

    State.variables.groupMessages.push({
      sender: sender,
      content: content,
      seen: false
    });
  }
});

// Initialize empty structures — content gets injected from passages
setup.inbox = [];       // Email + system messages go here
setup.instaFeed = [];   // Instagram-like posts go here

// Filter helper — get messages by month (if you want to use months)
setup.getMessagesForMonth = function(month) {
  return setup.inbox.filter(msg => msg.month === month);
};

// ========================
// MISC HELPER FUNCTIONS
// ========================

// Low-buff relief check
setup.shouldInjectRelief = function() {
  const buffs = (State.variables.connectedness || 0) + (State.variables.leisure || 0);
  return buffs < 2;
};

// ========================
// MONTH TRANSITION SYSTEM
// ========================

// Generate reflections based on the month's activities
setup.generateMonthReflections = function() {
  const v = State.variables;
  v.monthReflections = v.monthReflections || [];
  
  // Create new reflections for this month
  const newReflections = [];
  
  // Add reflections based on what the player did
  if (v.bujoPlans.length === 0) {
    newReflections.push("I didn't really commit to anything this month. Maybe I need to be more proactive?");
  }
  
  // Job hunting reflections
  if (v.timeLog && v.timeLog["jobhunt"]) {
    const jobTime = v.timeLog["jobhunt"];
    if (jobTime > 0.5) {
      newReflections.push("I spent a lot of time job hunting this month. It's exhausting, but I hope something comes through soon.");
    } else if (jobTime > 0) {
      newReflections.push("I've been sending out job applications. Fingers crossed!");
    }
  }
  
  // Add reflections for each activity
  if (v.bujoPlans) {
    for (const plan of v.bujoPlans) {
      // Generic reflection for each plan type
      if (plan.tags && plan.tags.includes("networking")) {
        newReflections.push("Networking feels awkward, but I met some interesting people.");
      } else if (plan.tags && plan.tags.includes("bureaucracy")) {
        newReflections.push("Dealing with paperwork is never fun, but at least it's done now.");
      } else if (plan.tags && plan.tags.includes("danish")) {
        newReflections.push("Learning Danish is challenging. 'Rødgrød med fløde' - I'll get there eventually!");
      }
      
      // Add specific reflections for certain activities
      if (plan.id === "oppo_course_01") {
        newReflections.push("The course was interesting. I wonder if it will actually help me get a job here.");
        v.skills = (v.skills || 0) + 1;
      }
    }
  }
  
  // Add a reflection about luck if applicable
  if (v.luck > 0.5) {
    newReflections.push("I'm feeling more optimistic about things working out here.");
  } else if (v.luck < 0.2) {
    newReflections.push("Sometimes I wonder if moving here was the right decision.");
  }
  
  // Save the reflections
  v.monthReflections = newReflections;
  
  return newReflections;
};

// Start a new month
setup.startNewMonth = function() {
  const v = State.variables;
  const oldMonth = v.month || 1;
  
  // Reset time variables
  v.month = oldMonth + 1;
  v.timeBucket = 0;
  v.provisionalTime = 0;
  v.timeLog = {};
  v.advance = false;
  v.changedmind = false;
  
  // Status for the new month
  v.firstmonth = false;
  v.newMonthStarted = true;
  
  // Update opportunities - some expire, some persist
  setup.updateOpportunities(oldMonth);
  
  // Clear plans but keep reflections
  v.bujoPlans = [];
  
  console.log("Month advanced to: " + v.month);
};

// Update opportunities based on month transition
setup.updateOpportunities = function(oldMonth) {
  const v = State.variables;
  
  // Filter existing opportunities
  if (v.bujoOpportunities && v.bujoOpportunities.length) {
    // Keep only non-time-sensitive opportunities (those without 'expires' or with 'expires' > current month)
    v.bujoOpportunities = v.bujoOpportunities.filter(opp => 
      !opp.expires || opp.expires > v.month
    );
  }
  
  // Add new opportunities based on the month
  const newMonth = oldMonth + 1;
  
  // Example opportunity creation for month 2
  if (newMonth === 2) {
    // Add some month 2 specific opportunities
    const month2Opportunities = [
      {
        id: "oppo_volunteer_01",
        linkId: "volunteer_01",
        label: "Volunteer at the International House",
        timeCost: 0.2,
        prose: "Help newcomers adjust to Denmark",
        tags: ["networking", "opportunity"],
        expires: 3
      },
      {
        id: "oppo_danish_02",
        linkId: "danish_02",
        label: "Join the Danish conversation club",
        timeCost: 0.1,
        prose: "Practice Danish in a casual setting",
        tags: ["danish", "networking", "opportunity"]
      }
    ];
    
    // Add new opportunities that don't already exist
    for (const opp of month2Opportunities) {
      if (!v.bujoOpportunities.some(o => o.id === opp.id)) {
        v.bujoOpportunities.push(opp);
      }
    }
    
    // Also add to the master list if not there already
    for (const opp of month2Opportunities) {
      if (!v.allOpportunities.some(o => o.id === opp.id)) {
        v.allOpportunities.push(opp);
      }
    }
  }
  
  console.log(`Updated opportunities for month ${newMonth}. Total: ${v.bujoOpportunities.length}`);
};

// Remove a plan
setup.removePlan = function(index) {
  const v = State.variables;
  
  if (index >= 0 && index < v.bujoPlans.length) {
    const plan = v.bujoPlans[index];
    
    // Remove the time cost
    if (plan.id && v.timeLog[plan.id]) {
      v.timeBucket -= v.timeLog[plan.id];
      v.provisionalTime -= v.timeLog[plan.id];
      delete v.timeLog[plan.id];
    }
    
    // Remove the plan
    v.bujoPlans.splice(index, 1);
    
    // Check if we need to update the advance state
    if (v.timeBucket < 1.0) {
      v.advance = false;
    }
    
    console.log(`Removed plan: ${plan.label}. New time: ${v.timeBucket}`);
  }
};