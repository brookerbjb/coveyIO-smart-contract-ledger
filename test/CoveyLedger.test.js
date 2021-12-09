const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CoveyLedger = artifacts.require('CoveyLedger');

contract('CoveyLedger', async (accounts) => {
    it('deploys successfully', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        assert(coveyLedger.address);
    });

    it('Allows user to place a trade', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        await coveyLedger.placeTrade('APPL:0.2,GOOGL:0.1', {
            from: accounts[0],
        });
        const userTrades = await coveyLedger.getUserTrades(accounts[0]);
        assert.equal(1, userTrades.length);
    });

    it('Fetches trades for a given user', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';
        await coveyLedger.placeTrade(positions, {
            from: accounts[0],
        });
        const userTrades = await coveyLedger.getUserTrades(accounts[0]);
        assert.equal(accounts[0], userTrades[0].trader);
        assert.equal(positions, userTrades[0].positions);
    });

    it('Fetches all trades on the contract', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);
        const positions = 'APPL:0.2';
        const positions_two = 'GOOGL:0.2';
        const positions_three = 'ETHUSDT:0.1';

        await coveyLedger.placeTrade(positions, {
            from: accounts[0],
        });

        await coveyLedger.placeTrade(positions_two, {
            from: accounts[1],
        });
        await coveyLedger.placeTrade(positions_three, {
            from: accounts[2],
        });
        const allTrades = await coveyLedger.getAllTrades({ from: accounts[0] });
        assert.equal(3, allTrades.length);
    });

    it('upgrades successfully without losing data', async () => {
        const coveyLedger = await deployProxy(CoveyLedger);

        await coveyLedger.placeTrade('APPL:0.2,GOOGL:0.1', {
            from: accounts[0],
        });

        const coveyLedger2 = await upgradeProxy(
            coveyLedger.address,
            CoveyLedger
        );

        const userTrades = await coveyLedger2.getUserTrades(accounts[0]);
        assert.equal(1, userTrades.length);
    });
});
