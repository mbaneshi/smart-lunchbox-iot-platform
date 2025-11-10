import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  preferences: {
    temperatureUnit: 'celsius' | 'fahrenheit';
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public preferences!: {
    temperatureUnit: 'celsius' | 'fahrenheit';
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        temperatureUnit: 'celsius',
        notificationsEnabled: true,
        theme: 'auto',
        language: 'en'
      }
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

export default User;
