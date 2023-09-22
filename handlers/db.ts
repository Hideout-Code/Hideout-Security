// Init Sequelize & Local DB
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
const sequelize = new Sequelize(process.env.DB!, process.env.DB_USER!, process.env.DB_PASS!, {
	host: process.env.DB_HOST!,
	dialect: "mysql",
	logging: false
});

export interface userDBModel extends Model<InferAttributes<userDBModel>, InferCreationAttributes<userDBModel>> {
    userID: string;
    inviterID: CreationOptional<string>;
    messageCounter: CreationOptional<number>;
    joinCount: CreationOptional<number>;
};

export const userDB = sequelize.define<userDBModel>("userInfo", {
    userID: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    inviterID: DataTypes.STRING,
    messageCounter: {type: DataTypes.BIGINT, defaultValue: 0},
    joinCount: {type: DataTypes.BIGINT, defaultValue: 1},
});
userDB.sync();

export interface messageDBModel extends Model<InferAttributes<messageDBModel>, InferCreationAttributes<messageDBModel>> {
    id: string;
    userID: CreationOptional<string>;
    content: CreationOptional<string>;
    attachments: CreationOptional<string>;
};

export const MessageDB: any = sequelize.define<messageDBModel>("messages", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    userID: DataTypes.STRING,
    content: DataTypes.TEXT,	
    attachments: DataTypes.TEXT,
});
MessageDB.sync();

export interface inviteModel extends Model<InferAttributes<inviteModel>, InferCreationAttributes<inviteModel>> {
    code: string;
    authorID: CreationOptional<string>;
    uses: CreationOptional<number>;
};

// Define the tables, create any missing, fix columns & rows.
export const inviteDB = sequelize.define<inviteModel>("invites", {
    code: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    authorID: DataTypes.STRING,
    uses: {type: DataTypes.BIGINT, defaultValue: 0}
});
inviteDB.sync();

export interface banModel extends Model<InferAttributes<banModel>, InferCreationAttributes<banModel>> {
    user: string;
    reason: string;
    staff: string;
};

export const banDB = sequelize.define<banModel>("bans", {
    user: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
    },
    reason: DataTypes.STRING,
    staff: DataTypes.STRING,
});
banDB.sync();

export interface tempRoleModel extends Model<InferAttributes<tempRoleModel>, InferCreationAttributes<tempRoleModel>> {
    id: CreationOptional<number>;
    user: string;
    role: string;
    whenAdded: number;
    whenToRemove: number;
};

export const tempRoleDB = sequelize.define<tempRoleModel>("tempRoles", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    user: DataTypes.STRING,
    role: DataTypes.STRING,
    whenAdded: {type: DataTypes.BIGINT, defaultValue: 0},
    whenToRemove: {type: DataTypes.BIGINT, defaultValue: 0},
});
tempRoleDB.sync();

export interface blacklistModel extends Model<InferAttributes<blacklistModel>, InferCreationAttributes<blacklistModel>> {
    userID: string;
    reason: string;
  }

  export const blacklistDB: any = sequelize.define<blacklistModel>('blacklist', {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    reason: DataTypes.STRING,
  });
  blacklistDB.sync();

  export async function blacklistCheck(user: string): Promise<boolean> {
    if ((await blacklistDB.count({ where: { userID: user } })) > 0) {
      return true;
    } else {
      return false;
    }
  }