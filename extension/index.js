"use strict";

module.exports = function(nodecg) {
  const twitchApi = nodecg.extensions["lfg-twitchapi"];

  if (twitchApi === undefined) {
    nodecg.log.error(
      "The lfg-twitchapi needs to be installed and configured for this bundle to work"
    );
    return;
  }

  const lastFollowTsRepl = nodecg.Replicant("lastFollowTs", {
    defaultValue: 0
  });
  setInterval(getFollowers, nodecg.bundleConfig.updateFollowersInterval * 1000);
  getFollowers();

  function getFollowers() {
    twitchApi
      .get("/users/follows?to_id=" + nodecg.bundleConfig.channelId, {
        limit: 25
      })
      .then(response => {
        if (response.statusCode !== 200) {
          nodecg.log.error(response.body.error, response.body.message);
          return;
        }

        var newLastFollowTs = lastFollowTsRepl.value;
        for (let i = 0; i < response.body.data.length; i++) {
          const follow = response.body.data[i];
          const createdAt = Date.parse(follow.followed_at);
          if (createdAt <= lastFollowTsRepl.value) {
            break;
          }
          if (createdAt > newLastFollowTs) {
            newLastFollowTs = createdAt;
          }
          nodecg.log.info("Last follow ts", lastFollowTsRepl.value);
          nodecg.log.info("This follow ts", createdAt);
          nodecg.log.info("New Follower", follow.to_name);
          nodecg.sendMessage("new-follow", follow.to_name);
        }
        lastFollowTsRepl.value = newLastFollowTs;
      })
      .catch(err => {
        nodecg.log.error("Mysterious error", err);
      });
  }
};
