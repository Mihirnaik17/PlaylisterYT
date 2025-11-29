import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
//const mongoose = require('mongoose')
const dbManager = require('../db'); 
const testData = require('./data/example-db-data.json');

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
    // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
    // await mongoose
    //     .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    //     .catch(e => {
    //         console.error('Connection error', e.message)
    //     })

    await dbManager.initialize();
    console.log('Database connected for testing');
});

/**
 * Executed before each test is performed.
 */
beforeEach(async () => {
     await dbManager.resetDatabase(testData);
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(() => {
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) Reading a User from the Database', () => {
    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        // FILL IN EXPECTED DATA
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = {};

    // READ THE USER
    // actualUser = dbManager.somethingOrOtherToGetAUser(...)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName, actualUser.firstName)
    expect(expectedUser.lastName, actualUser.lastName);
    // AND SO ON
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #2) Creating a User in the Database', () => {
    // MAKE A TEST USER TO CREATE IN THE DATABASE
    const testUser = {
        // FILL IN TEST DATA, INCLUDE AN ID SO YOU CAN GET IT LATER
    };

    // CREATE THE USER
    // dbManager.somethingOrOtherToCreateAUser(...)

    // NEXT TEST TO SEE IF IT WAS PROPERLY CREATED

    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        // FILL IN EXPECTED DATA
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = {};

    // READ THE USER
    // actualUser = dbManager.somethingOrOtherToGetAUser(...)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName, actualUser.firstName)
    expect(expectedUser.lastName, actualUser.lastName);
    // AND SO ON

});

// THE REST OF YOUR TEST SHOULD BE PUT BELOW


test('getUserById returns a user', async () => {

    const user = await dbManager.getUserByEmail('joe@shmo.com');
    const userId = user.id || user._id;
    const foundUser = await dbManager.getUserById(userId);
    
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe('joe@shmo.com');
    expect(foundUser.firstName).toBe('Joe');
    expect(foundUser.lastName).toBe('Shmo');
});

test('getUserByEmail returns a user', async () => {
    const user = await dbManager.getUserByEmail('jane@doe.com');
    
    expect(user).toBeDefined();
    expect(user.firstName).toBe('Jane');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('jane@doe.com');
});

test('createUser creates a new user', async () => {
    const newUser = {
        firstName: 'Mihir',
        lastName: 'Naik',
        email: 'myemail.com',
        passwordHash: 'hashedpassword123'
    };
    
    const created = await dbManager.createUser(newUser);
    
    expect(created).toBeDefined();
    expect(created.email).toBe('myemail.com');
    expect(created.firstName).toBe('Mihir');
    expect(created.lastName).toBe('Naik');

    const retrieved = await dbManager.getUserByEmail('myemail.com');
    expect(retrieved).toBeDefined();
    expect(retrieved.email).toBe('myemail.com');
});

test('getPlaylistsByOwnerEmail returns user playlists', async () => {
    const playlists = await dbManager.getPlaylistsByOwnerEmail('joe@shmo.com');
    
    expect(playlists).toBeDefined();
    expect(playlists.length).toBeGreaterThan(0);
    playlists.forEach(playlist => {
        expect(playlist.ownerEmail).toBe('joe@shmo.com');
    });
});

test('getAllPlaylists returns all playlists', async () => {
    const playlists = await dbManager.getAllPlaylists();
    
    expect(playlists).toBeDefined();
    expect(playlists.length).toBeGreaterThan(0);
    expect(playlists.length).toBeGreaterThanOrEqual(5);
});

test('getPlaylistById returns a playlist', async () => {
    const playlists = await dbManager.getAllPlaylists();
    expect(playlists.length).toBeGreaterThan(0);
    
    const firstPlaylist = playlists[0];
    const playlistId = firstPlaylist.id || firstPlaylist._id;
    const retrieved = await dbManager.getPlaylistById(playlistId);
    
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe(firstPlaylist.name);
    expect(retrieved.ownerEmail).toBe(firstPlaylist.ownerEmail);
});

test('updatePlaylist updates playlist data', async () => {
    const playlists = await dbManager.getPlaylistsByOwnerEmail('joe@shmo.com');
    const playlist = playlists[0];
    const playlistId = playlist.id || playlist._id;
    const updateData = {
        name: 'Updated Playlist Name',
        songs: [
            {
                title: 'New Song',
                artist: 'New Artist',
                year: 2025,
                youTubeId: 'new123'
            }
        ]
    };
    
    await dbManager.updatePlaylist(playlistId, updateData);

    const updated = await dbManager.getPlaylistById(playlistId);
    expect(updated.name).toBe('Updated Playlist Name');
    expect(updated.songs.length).toBe(1);
    expect(updated.songs[0].title).toBe('New Song');
});

test('deletePlaylist removes a playlist', async () => {
    const newPlaylist = {
        name: 'Playlist to Delete',
        ownerEmail: 'jane@doe.com',
        songs: []
    };
    const created = await dbManager.createPlaylist(newPlaylist);
    const playlistId = created.id || created._id;

    let retrieved = await dbManager.getPlaylistById(playlistId);
    expect(retrieved).toBeDefined();

    await dbManager.deletePlaylist(playlistId);
    retrieved = await dbManager.getPlaylistById(playlistId);
    expect(retrieved).toBeNull();
});