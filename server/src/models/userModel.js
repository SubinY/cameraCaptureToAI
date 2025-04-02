/**
 * 用户模型 - 管理用户数据和连接信息
 */

// 存储活跃的WebRTC连接
const activeConnections = new Map();

/**
 * 添加用户连接
 * @param {string} userId - 用户ID
 * @param {Object} socket - Socket.IO连接
 */
function addUserConnection(userId, socket) {
    console.log(`添加用户连接: ${userId}`);
    activeConnections.set(userId, {
        socket,
        lastAnalysisTime: 0,
        frameCount: 0,
        connected: true,
        connectedAt: Date.now()
    });

    console.log(`用户连接已添加: ${userId}`);
    return getUserConnection(userId);
}

/**
 * 获取用户连接
 * @param {string} userId - 用户ID
 * @returns {Object|null} - 用户连接信息
 */
function getUserConnection(userId) {
    return activeConnections.get(userId) || null;
}

/**
 * 更新用户连接信息
 * @param {string} userId - 用户ID
 * @param {Object} data - 要更新的数据
 */
function updateUserConnection(userId, data) {
    const connection = getUserConnection(userId);
    if (connection) {
        Object.assign(connection, data);
        activeConnections.set(userId, connection);
        return true;
    }
    return false;
}

/**
 * 移除用户连接
 * @param {string} userId - 用户ID
 */
function removeUserConnection(userId) {
    if (activeConnections.has(userId)) {
        activeConnections.delete(userId);
        console.log(`用户连接已移除: ${userId}`);
        return true;
    }
    return false;
}

/**
 * 获取所有活跃用户
 * @returns {Array} - 活跃用户列表
 */
function getActiveUsers() {
    const users = [];
    for (const [userId, connection] of activeConnections.entries()) {
        users.push({
            userId,
            connectedAt: connection.connectedAt,
            frameCount: connection.frameCount
        });
    }
    return users;
}

module.exports = {
    addUserConnection,
    getUserConnection,
    updateUserConnection,
    removeUserConnection,
    getActiveUsers
};