const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CoveyLedger = artifacts.require('CoveyLedger');

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

    it('Allows a partial copy to AddressSwitch when both addresses have content', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';
        const positionsTwo = 'GOOGL:0.1';
        const positionsThree = 'NFLX:0.4';
        const positionsFour = 'NVDA:0.1';
        const positionsFive = 'VIN:0.2';

        await coveyLedger.createContent(positions, {
            from: accounts[0],
        });

        let err = null;

        await coveyLedger.createContent(positionsTwo, {
            from: accounts[2],
        });

        await coveyLedger.createContent(positionsThree, {
            from: accounts[2],
        });

        await coveyLedger.createContent(positionsFour, {
            from: accounts[0],
        });

        await coveyLedger.createContent(positionsFive, {
            from: accounts[2],
        });

        await coveyLedger.AddressSwitch(accounts[0], accounts[2], {
            from: accounts[0],
        });

        let userTrades = await coveyLedger.getAnalystContent(accounts[2]);
        console.log(userTrades);
        assert.equal(4, userTrades.length);
    });
});
