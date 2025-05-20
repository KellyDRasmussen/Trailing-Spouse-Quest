// Reset Month Helper
setup.resetMonth = function () {
  State.variables.month += 1;
  State.variables.timeBucket = 0;
  State.variables.advance = false;
  State.variables.bujoPlans = [];
  State.variables.bujoOpportunities = [];
  State.variables.kidsPickedUp = false;
  State.variables.changedmind = false;
  State.variables.application_state = "";
  State.variables.newMonthStarted = true;
};


// 🟢 Group Chat Message Macro
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

// 🟢 Initialize empty structures — content gets injected from passages
setup.inbox = [];       // Email + system messages go here
setup.instaFeed = [];   // Instagram-like posts go here

// 🟢 Filter helper — get messages by month (if you want to use months)
setup.getMessagesForMonth = function(month) {
  return setup.inbox.filter(msg => msg.month === month);
};

// 🟢  helper to add opportunity IDs to BuJo invites
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




// 🟢  low-buff relief check
setup.shouldInjectRelief = function() {
  const buffs = (State.variables.connectedness || 0) + (State.variables.leisure || 0);
  return buffs < 2;
};

// job hunting

setup.jobhuntSelect = function(id, time, luck, text) {
    const v = State.variables;

    const prev = v.application_state;
    if (prev !== "" && prev !== id) {
        v.changedmind = true;
    }

    if (!v.changedmind && luck > 0) {
        v.luck += luck;
    }

    v.application_state = id;
    v.activities = true;
    v.selectedJobTime = time;
    v.jobMessage = text;

    v.timeLog = v.timeLog || {};
    if (v.timeLog["jobhunt"]) {
        v.provisionalTime -= v.timeLog["jobhunt"];
        delete v.timeLog["jobhunt"];
    }

    if (time > 0) {
        v.timeLog["jobhunt"] = time;
        v.provisionalTime += time;
    }

    Engine.play("JobConfirm");
};
