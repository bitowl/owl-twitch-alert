'use strict';

module.exports = function (nodecg) {
    const twitchApi = nodecg.extensions['lfg-twitchapi'];
    console.log(nodecg.bundleConfig.updateFollowersInterval);

    const lastFollowTsRepl = nodecg.Replicant('lastFollowTs', { defaultValue: 0 });
    setInterval(getFollowers, nodecg.bundleConfig.updateFollowersInterval);
    getFollowers();

    function getFollowers() {

        twitchApi.get('/channels/' + nodecg.bundleConfig.channel + '/follows', {
            limit: 25,
        }).then(response => {
            if (response.statusCode !== 200) {
                nodecg.log.error(response.body.error, response.body.message);
                return;
            }

            var newLastFollowTs = lastFollowTsRepl.value;
            for (let i = 0; i < response.body.follows.length; i++) {
                const follow = response.body.follows[i];
                const createdAt = Date.parse(follow.created_at);
                if (createdAt <= lastFollowTsRepl.value) {
                    break;
                }
                if (createdAt > newLastFollowTs) {
                    newLastFollowTs = createdAt;
                }
                nodecg.log.info('New Follower', follow.user);
                
                
            }
            lastFollowTsRepl.value = newLastFollowTs;
        }).catch(err => {
            nodecg.log.error(err);
        });
    }
};