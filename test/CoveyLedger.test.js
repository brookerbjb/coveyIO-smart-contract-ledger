const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CoveyLedger = artifacts.require('CoveyLedger');
const positionsData = require('./TestData.json');

// a comment

contract('CoveyLedger', async (accounts) => {
    it('deploys successfully', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        assert(coveyLedger.address);
    });

    it('Allows user to place a trade', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        await coveyLedger.createContent('APPL:0.2,GOOGL:0.1', {
            from: accounts[0],
        });
        const userTrades = await coveyLedger.getAnalystContent(accounts[0]);
        assert.equal(1, userTrades.length);
    });

    it('Fetches trades for a given user', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';
        await coveyLedger.createContent(positions, {
            from: accounts[0],
        });
        const userTrades = await coveyLedger.getAnalystContent(accounts[0]);
        assert.equal(accounts[0], userTrades[0][0]);
        assert.equal(positions, userTrades[0][1]);
    });

    it('Fetches all trades on the contract', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';
        const positions_two = 'GOOGL:0.2';
        const positions_three = 'ETHUSDT:0.1';

        await coveyLedger.createContent(positions, {
            from: accounts[0],
        });

        await coveyLedger.createContent(positions_two, {
            from: accounts[1],
        });
        await coveyLedger.createContent(positions_three, {
            from: accounts[2],
        });
        const allTrades = await coveyLedger.getAllContent({
            from: accounts[0],
        });
        assert.equal(3, allTrades.length);
    });

    it('upgrades successfully without losing data', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);

        await coveyLedger.createContent('APPL:0.2,GOOGL:0.1', {
            from: accounts[0],
        });

        const coveyLedger2 = await upgradeProxy(
            coveyLedger.address,
            CoveyLedger
        );

        const userTrades = await coveyLedger2.getAnalystContent(accounts[0]);
        assert.equal(1, userTrades.length);
    });

    it('Does not allow AddressSwitch unless sender is the old address', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);

        await coveyLedger.createContent('APPL:0.2,GOOGL:0.1', {
            from: accounts[0],
        });

        let err = null;

        try {
            await coveyLedger.AddressSwitch(accounts[0], accounts[1], {
                from: accounts[1],
            });
        } catch (error) {
            err = error;
        }

        assert.ok(err instanceof Error);
    });

    it('Allows user to AddressSwitch and copies all data', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';

        await coveyLedger.createContent(positions, {
            from: accounts[0],
        });

        let err = null;

        try {
            await coveyLedger.AddressSwitch(accounts[0], accounts[1], {
                from: accounts[0],
            });
        } catch (error) {
            err = error;
        }

        const userTrades = await coveyLedger.getAnalystContent(accounts[1]);
        assert.equal(1, userTrades.length);
    });

    it('Does a partial copy when both addresses have content', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);

        const firstHalf = positionsData.slice(0, positionsData.length / 2);
        const secondHalf = positionsData.slice(
            positionsData.length / 2,
            positionsData.length
        );

        for (let p in firstHalf) {
            await coveyLedger.createContent(firstHalf[p], {
                from: accounts[0],
            });
        }

        for (let p2 in secondHalf) {
            await coveyLedger.createContent(secondHalf[p2], {
                from: accounts[2],
            });
        }

        const copyIndexes = [];
        firstHalf.forEach((p, idx) => copyIndexes.push(idx));

        await coveyLedger.AddressCopy(accounts[0], accounts[2], copyIndexes, {
            from: accounts[0],
        });

        let userTrades = await coveyLedger.getAnalystContent(accounts[2]);
        assert.equal(positionsData.length, userTrades.length);
    });

    it('Does not allow partial copies after first trade on new ledger', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);

        const firstHalf = positionsData.slice(0, 10);
        const secondHalf = positionsData.slice(10, 20);
        const thirdHalf = positionsData.slice(20, 30);

        for (let p in firstHalf) {
            await coveyLedger.createContent(firstHalf[p], {
                from: accounts[0],
            });
        }

        for (let p2 in secondHalf) {
            await coveyLedger.createContent(secondHalf[p2], {
                from: accounts[2],
            });
        }

        for (let p3 in thirdHalf) {
            await coveyLedger.createContent(thirdHalf[p3], {
                from: accounts[0],
            });
        }

        const copyIndexes = [21, 22, 23];

        let err = null;

        try {
            await coveyLedger.AddressCopy(
                accounts[0],
                accounts[2],
                copyIndexes,
                {
                    from: accounts[0],
                }
            );
        } catch (error) {
            err = error;
        }

        assert.ok(err instanceof Error);
    });
});
